const mongoose = require("mongoose");

const securityLogSchema = new mongoose.Schema(
  {
    username: { type: String, default: "anonymous" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip: { type: String, index: true },
    location: {
      city: String,
      country: String,
      source: String
    },
    route: String,
    method: String,
    status: String,
    statusCode: Number,
    userAgent: String,
    threatScore: { type: Number, default: 0 },
    threatLevel: { type: String, default: "Safe" },
    actionTaken: { type: String, default: "Allow" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.SecurityLog || mongoose.model("SecurityLog", securityLogSchema);
