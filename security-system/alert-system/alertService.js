const SecurityAlert = require("../models/SecurityAlert");

async function createAlert(alert) {
  return SecurityAlert.create({
    type: alert.type,
    message: alert.message,
    severity: alert.severity || "Medium",
    actionTaken: alert.actionTaken || "Logged",
    ip: alert.ip,
    userId: alert.userId,
    metadata: alert.metadata || {}
  });
}

module.exports = {
  createAlert
};
