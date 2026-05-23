const BlockedIP = require("../models/BlockedIP");
const { createAlert } = require("../alert-system/alertService");

async function isIpBlocked(ip) {
  const block = await BlockedIP.findOne({
    ip,
    blockedUntil: { $gt: new Date() }
  }).lean();

  return block;
}

async function blockIp(ip, durationMs, reason = "Suspicious activity", severity = "Critical") {
  const now = new Date();
  const blockedUntil = new Date(now.getTime() + durationMs);

  const block = await BlockedIP.findOneAndUpdate(
    { ip },
    {
      ip,
      reason,
      severity,
      blockedAt: now,
      blockedUntil
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await createAlert({
    type: "IP Block",
    severity,
    message: `${ip} blocked until ${blockedUntil.toISOString()} because ${reason}.`,
    actionTaken: `Temporary IP block until ${blockedUntil.toISOString()}`,
    ip
  });

  return block;
}

async function unblockIp(ip) {
  return BlockedIP.deleteOne({ ip });
}

module.exports = {
  isIpBlocked,
  blockIp,
  unblockIp
};
