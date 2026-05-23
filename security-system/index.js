const { createSecurityMonitor } = require("./middleware/securityMonitor");
const { secureFileFilter, inspectFileUpload } = require("./middleware/uploadMonitor");
const { securityDashboardRoutes } = require("./monitoring-dashboard/securityRoutes");
const {
  evaluateLoginDefense,
  recordFailedLogin,
  recordSuccessfulLogin,
  getClientIp
} = require("./detection-engine/loginProtection");
const { blockIp, unblockIp, isIpBlocked } = require("./detection-engine/ipBlocking");

module.exports = {
  createSecurityMonitor,
  secureFileFilter,
  inspectFileUpload,
  securityDashboardRoutes,
  evaluateLoginDefense,
  recordFailedLogin,
  recordSuccessfulLogin,
  getClientIp,
  blockIp,
  unblockIp,
  isIpBlocked
};
