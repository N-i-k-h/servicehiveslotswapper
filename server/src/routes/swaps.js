import express from "express";
import mongoose from "mongoose";
import { authRequired } from "../middleware/auth.js";
import { Event, EventStatus } from "../models/Event.js";
import { SwapRequest, SwapStatus } from "../models/SwapRequest.js";

const router = express.Router();
router.use(authRequired);

/**
 * 🟢 Get all swappable slots (not mine)
 */
router.get("/swappable-slots", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const slots = await Event.find({
      owner: { $ne: userId },
      status: EventStatus.SWAPPABLE,
    }).populate("owner", "name email");

    res.json(slots);
  } catch (err) {
    console.error("❌ Error fetching swappable slots:", err);
    res.status(500).json({ message: "Failed to load swappable slots" });
  }
});

/**
 * 🟢 Create a swap request
 */
router.post("/swap-request", async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;
    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ message: "Both slot IDs required" });
    }

    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot)
      return res.status(404).json({ message: "Slot not found" });

    if (mySlot.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your event" });

    if (
      mySlot.status !== EventStatus.SWAPPABLE ||
      theirSlot.status !== EventStatus.SWAPPABLE
    ) {
      return res.status(400).json({ message: "Both must be swappable" });
    }

    const existing = await SwapRequest.findOne({
      mySlot: mySlotId,
      theirSlot: theirSlotId,
      status: SwapStatus.PENDING,
    });

    if (existing) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const reqDoc = await SwapRequest.create({
      requester: req.user.id,
      responder: theirSlot.owner,
      mySlot: mySlotId,
      theirSlot: theirSlotId,
    });

    await Event.updateMany(
      { _id: { $in: [mySlotId, theirSlotId] } },
      { $set: { status: EventStatus.SWAP_PENDING } }
    );

    const populated = await SwapRequest.findById(reqDoc._id).populate(
      "mySlot theirSlot requester responder",
      "title name email status"
    );

    console.log(`✅ Swap request created by ${populated.requester.name}`);
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Error creating swap request:", err);
    res.status(500).json({ message: "Failed to create swap request" });
  }
});

/**
 * 🟢 Get incoming swap requests
 */
router.get("/requests/incoming", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const requests = await SwapRequest.find({ responder: userId })
      .populate("mySlot theirSlot requester responder", "title name email status")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching incoming:", err);
    res.status(500).json({ message: "Failed to load incoming requests" });
  }
});

/**
 * 🟢 Get outgoing swap requests
 */
router.get("/requests/outgoing", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const requests = await SwapRequest.find({ requester: userId })
      .populate("mySlot theirSlot requester responder", "title name email status")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching outgoing:", err);
    res.status(500).json({ message: "Failed to load outgoing requests" });
  }
});

/**
 * 🟢 Accept or reject swap
 */
router.post("/swap-response/:id", async (req, res) => {
  try {
    const { accept } = req.body;
    const swap = await SwapRequest.findById(req.params.id)
      .populate("mySlot theirSlot requester responder");

    if (!swap) {
      return res.status(404).json({ message: "Request not found" });
    }

    const responderId = swap.responder._id.toString();
    if (responderId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (accept) {
      swap.status = SwapStatus.ACCEPTED;

      // Swap owners
      const requesterId = swap.requester._id;
      const theirSlot = await Event.findById(swap.theirSlot._id);
      const mySlot = await Event.findById(swap.mySlot._id);

      const tmpOwner = mySlot.owner;
      mySlot.owner = theirSlot.owner;
      theirSlot.owner = tmpOwner;

      mySlot.status = EventStatus.BUSY;
      theirSlot.status = EventStatus.BUSY;

      await mySlot.save();
      await theirSlot.save();

      // Mark swap complete
      await SwapRequest.updateMany(
        { _id: swap._id },
        { $set: { status: SwapStatus.ACCEPTED } }
      );
    } else {
      swap.status = SwapStatus.REJECTED;
      await Event.updateMany(
        { _id: { $in: [swap.mySlot._id, swap.theirSlot._id] } },
        { $set: { status: EventStatus.SWAPPABLE } }
      );
    }

    await swap.save();

    const updated = await SwapRequest.findById(swap._id).populate(
      "mySlot theirSlot requester responder",
      "title name email status"
    );

    console.log(
      accept
        ? `✅ Swap accepted between ${updated.requester.name} and ${updated.responder.name}`
        : `❌ Swap rejected by ${updated.responder.name}`
    );

    res.json(updated);
  } catch (err) {
    console.error("❌ Error responding to swap:", err);
    res.status(500).json({ message: "Failed to respond to swap request" });
  }
});

export default router;
