const mongoose = require("mongoose");

const securityAlertSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Severe", "Critical"],
      default: "Medium",
      index: true
    },
    actionTaken: { type: String, default: "Logged" },
    ip: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acknowledged: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

securityAlertSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.SecurityAlert || mongoose.model("SecurityAlert", securityAlertSchema);
