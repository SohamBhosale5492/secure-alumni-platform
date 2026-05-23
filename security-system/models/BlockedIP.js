const mongoose = require("mongoose");

const blockedIpSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true, index: true },
    reason: { type: String, default: "Suspicious activity" },
    severity: { type: String, default: "Critical" },
    blockedAt: { type: Date, default: Date.now },
    blockedUntil: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.BlockedIP || mongoose.model("BlockedIP", blockedIpSchema);
