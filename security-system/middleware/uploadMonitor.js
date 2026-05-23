const path = require("path");
const { createAlert } = require("../alert-system/alertService");
const SecurityLog = require("../models/SecurityLog");
const { trackUpload } = require("../detection-engine/behaviorTracker");
const { blockIp } = require("../detection-engine/ipBlocking");
const { getClientIp } = require("../detection-engine/loginProtection");

const DANGEROUS_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".scr",
  ".ps1",
  ".vbs",
  ".js",
  ".jar",
  ".msi",
  ".sh"
]);

const SUSPICIOUS_FILENAME_PATTERNS = [
  /\.\./,
  /%00/i,
  /<script/i,
  /double\s*extension/i,
  /\.(php|asp|aspx|jsp)\./i
];

function inspectFileUpload(file) {
  const originalName = file.originalname || "";
  const extension = path.extname(originalName).toLowerCase();
  const suspiciousName = SUSPICIOUS_FILENAME_PATTERNS.some((pattern) => pattern.test(originalName));

  return {
    dangerous: DANGEROUS_EXTENSIONS.has(extension) || suspiciousName,
    extension,
    suspiciousName,
    originalName,
    score: DANGEROUS_EXTENSIONS.has(extension) || suspiciousName ? 50 : 0
  };
}

function secureFileFilter(allowedMimeTypes = []) {
  return function filter(req, file, cb) {
    const ip = getClientIp(req);
    const uploadCount = trackUpload(ip);
    const inspection = inspectFileUpload(file);
    const mimeAllowed = !allowedMimeTypes.length || allowedMimeTypes.includes(file.mimetype);

    if (inspection.dangerous || !mimeAllowed || uploadCount >= 20) {
      const actionTaken = uploadCount >= 20 ? "Temporary IP block" : "Upload rejected";
      const reason = inspection.dangerous
        ? `Dangerous upload blocked: ${file.originalname}`
        : !mimeAllowed
          ? `File MIME type rejected: ${file.mimetype}`
          : `Excessive uploads detected: ${uploadCount} uploads`;

      createAlert({
        type: "Suspicious File Upload",
        severity: uploadCount >= 20 ? "Critical" : "High",
        message: reason,
        actionTaken,
        ip,
        userId: req.user?._id,
        metadata: {
          fileName: file.originalname,
          mimetype: file.mimetype,
          uploadCount
        }
      }).catch(() => {});

      SecurityLog.create({
        username: req.user?.username || "anonymous",
        userId: req.user?._id,
        ip,
        route: req.originalUrl,
        method: req.method,
        status: "DANGEROUS_UPLOAD",
        statusCode: 400,
        threatScore: 50,
        threatLevel: "Warning",
        actionTaken,
        details: {
          fileName: file.originalname,
          mimetype: file.mimetype,
          uploadCount
        }
      }).catch(() => {});

      if (uploadCount >= 20) {
        blockIp(ip, 24 * 60 * 60 * 1000, "Excessive upload activity detected").catch(() => {});
      }

      return cb(new Error(reason));
    }

    return cb(null, true);
  };
}

module.exports = {
  secureFileFilter,
  inspectFileUpload,
  DANGEROUS_EXTENSIONS
};
