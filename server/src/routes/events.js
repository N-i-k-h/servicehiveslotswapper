import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Event, EventStatus } from "../models/Event.js";

const router = express.Router();

// ✅ Require authentication for all routes
router.use(authRequired);

// =============================
// Get all my events
// =============================
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ message: "Failed to load events" });
  }
});

// =============================
// Create a new event
// =============================
router.post("/", async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;

    // ✅ Make sure the user is logged in
    if (!req.user || !req.user.id) {
      console.error("❌ Missing req.user in event creation");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Create the event
    const event = await Event.create({
      title,
      startTime,
      endTime,
      owner: req.user.id,
      status: EventStatus.BUSY, // default status
    });

    console.log(`✅ Event created by ${req.user.id}: "${title}"`);
    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Event creation failed:", err);
    res.status(500).json({ message: "Create failed", error: err.message });
  }
});

// =============================
// Update event
// =============================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Event not found" });

    console.log(`✅ Event updated: ${req.params.id}`);
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// =============================
// Delete event
// =============================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Event.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Event not found" });

    console.log(`🗑️ Event deleted: ${req.params.id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
