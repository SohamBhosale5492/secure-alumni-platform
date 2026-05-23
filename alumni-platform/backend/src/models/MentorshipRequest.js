const mongoose = require("mongoose");

const mentorshipRequestSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goals: { type: String, required: true },
    preferredSchedule: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "completed"],
      default: "pending",
      index: true
    },
    adminNote: String
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.MentorshipRequest ||
  mongoose.model("MentorshipRequest", mentorshipRequestSchema);
