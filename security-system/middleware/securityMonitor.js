const SecurityLog = require("../models/SecurityLog");
const { createAlert } = require("../alert-system/alertService");
const { trackRequest, trackAttackPattern } = require("../detection-engine/behaviorTracker");
const { blockIp, isIpBlocked } = require("../detection-engine/ipBlocking");
const { inspectPayload } = require("../detection-engine/requestInspection");
const { getClientIp } = require("../detection-engine/loginProtection");
const { getThreatLevel, getProgressiveAction } = require("../detection-engine/threatScoring");
const { lookupLocation } = require("./geolocation");

const DEFAULT_REQUEST_LIMIT = 100;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const FIVE_DAYS_MS = 5 * ONE_DAY_MS;

function pathIsIgnored(path, ignoredPaths) {
  return ignoredPaths.some((ignoredPath) => {
    if (ignoredPath instanceof RegExp) {
      return ignoredPath.test(path);
    }

    return path.startsWith(ignoredPath);
  });
}

function createSecurityMonitor(options = {}) {
  const ignoredPaths = options.ignoredPaths || ["/health"];
  const requestLimitPerMinute = options.requestLimitPerMinute || DEFAULT_REQUEST_LIMIT;

  return async function securityMonitor(req, res, next) {
    if (pathIsIgnored(req.path, ignoredPaths)) {
      return next();
    }

    const ip = getClientIp(req);
    req.securityContext = {
      ip,
      threatScore: 0,
      threatLevel: "Safe",
      actionTaken: "Allow",
      indicators: []
    };

    try {
      const activeBlock = await isIpBlocked(ip);

      if (activeBlock) {
        await SecurityLog.create({
          username: req.user?.username || "anonymous",
          userId: req.user?._id,
          ip,
          route: req.originalUrl,
          method: req.method,
          status: "BLOCKED_IP",
          statusCode: 403,
          threatScore: 100,
          threatLevel: "Dangerous",
          actionTaken: "Temporary IP block",
          details: {
            reason: activeBlock.reason,
            blockedUntil: activeBlock.blockedUntil
          }
        });

        return res.status(403).json({
          message: "This IP address is temporarily blocked by the security system.",
          blockedUntil: activeBlock.blockedUntil
        });
      }

      const requestsPerMinute = trackRequest(ip);
      req.securityContext.requestsPerMinute = requestsPerMinute;

      if (requestsPerMinute >= requestLimitPerMinute) {
        await blockIp(ip, ONE_DAY_MS, `API abuse detected: ${requestsPerMinute} requests/minute`);

        await SecurityLog.create({
          username: req.user?.username || "anonymous",
          userId: req.user?._id,
          ip,
          route: req.originalUrl,
          method: req.method,
          status: "API_ABUSE",
          statusCode: 429,
          threatScore: 80,
          threatLevel: "Dangerous",
          actionTaken: "Temporary IP block",
          details: {
            requestsPerMinute
          }
        });

        return res.status(429).json({
          message: "Too many requests. Your IP has been temporarily blocked.",
          actionTaken: "Temporary IP block"
        });
      }

      const inspection = inspectPayload(req);

      if (inspection.suspicious) {
        const repeatedCount = trackAttackPattern(ip, "payload-injection");
        const threatScore = repeatedCount >= 3 ? 100 : inspection.score;
        const actionTaken =
          repeatedCount >= 3 ? "Temporary IP block" : getProgressiveAction(threatScore);

        req.securityContext.threatScore = threatScore;
        req.securityContext.threatLevel = getThreatLevel(threatScore);
        req.securityContext.actionTaken = actionTaken;
        req.securityContext.indicators.push("Injection/XSS attempt");

        await createAlert({
          type: "Injection/XSS Attempt",
          severity: repeatedCount >= 3 ? "Critical" : "High",
          message: `Suspicious payload detected on ${req.method} ${req.originalUrl}.`,
          actionTaken,
          ip,
          userId: req.user?._id,
          metadata: {
            matches: inspection.matches,
            repeatedCount
          }
        });

        if (repeatedCount >= 3) {
          await blockIp(ip, FIVE_DAYS_MS, "Repeated injection or XSS attack patterns detected");
        }
      }

      res.on("finish", async () => {
        try {
          const location = await lookupLocation(ip, options.geolocationProviderUrl);

          await SecurityLog.create({
            username: req.user?.username || req.body?.email || "anonymous",
            userId: req.user?._id,
            ip,
            location,
            route: req.originalUrl,
            method: req.method,
            status: req.securityContext.indicators.length ? "SUSPICIOUS_REQUEST" : "REQUEST",
            statusCode: res.statusCode,
            userAgent: req.headers["user-agent"],
            threatScore: req.securityContext.threatScore,
            threatLevel: req.securityContext.threatLevel,
            actionTaken: req.securityContext.actionTaken,
            details: {
              indicators: req.securityContext.indicators,
              requestsPerMinute: req.securityContext.requestsPerMinute
            }
          });
        } catch (error) {
          if (options.onError) {
            options.onError(error);
          }
        }
      });

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  createSecurityMonitor
};
