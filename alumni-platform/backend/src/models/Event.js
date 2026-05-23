const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    mode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      default: "offline"
    },
    location: String,
    meetingLink: String,
    capacity: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
