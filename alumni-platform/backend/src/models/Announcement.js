const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    audience: {
      type: String,
      enum: ["all", "alumni", "student", "admin"],
      default: "all",
      index: true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
