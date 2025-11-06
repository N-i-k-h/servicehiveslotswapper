import mongoose from "mongoose";

export const SwapStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
};

const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mySlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    theirSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SwapStatus),
      default: SwapStatus.PENDING,
    },

    // ✅ Optional but highly useful additions:
    message: {
      type: String,
      default: "",
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // who last updated it
    },
    actionAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ✅ Automatically track last action info
swapSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status !== SwapStatus.PENDING) {
    this.actionAt = new Date();
  }
  next();
});

// ✅ Optional virtuals for cleaner frontend population
swapSchema.virtual("requesterName", {
  ref: "User",
  localField: "requester",
  foreignField: "_id",
  justOne: true,
});

swapSchema.virtual("responderName", {
  ref: "User",
  localField: "responder",
  foreignField: "_id",
  justOne: true,
});

export const SwapRequest = mongoose.model("SwapRequest", swapSchema);
