const SecurityLog = require("../models/SecurityLog");
const { createAlert } = require("../alert-system/alertService");
const { trackFailedLogin, resetFailedLogins } = require("./behaviorTracker");

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || "unknown";
}

function getLoginPolicy(failedAttempts) {
  if (failedAttempts >= 12) {
    return {
      level: "Severe",
      action: "Temporary account lock",
      lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      captchaRequired: true,
      cooldownUntil: null
    };
  }

  if (failedAttempts >= 8) {
    return {
      level: "High",
      action: "CAPTCHA required",
      lockedUntil: null,
      captchaRequired: true,
      cooldownUntil: null
    };
  }

  if (failedAttempts >= 4) {
    return {
      level: "Medium",
      action: "Cooldown",
      lockedUntil: null,
      captchaRequired: false,
      cooldownUntil: new Date(Date.now() + 30 * 1000)
    };
  }

  return {
    level: "Low",
    action: "Warning",
    lockedUntil: null,
    captchaRequired: false,
    cooldownUntil: null
  };
}

function evaluateLoginDefense({ user, captchaToken, captchaBypassToken }) {
  const now = new Date();

  if (user?.lockedUntil && user.lockedUntil > now) {
    return {
      allowed: false,
      statusCode: 423,
      reason: "Account is temporarily locked.",
      action: "Temporary account lock",
      retryAt: user.lockedUntil
    };
  }

  if (user?.cooldownUntil && user.cooldownUntil > now) {
    return {
      allowed: false,
      statusCode: 429,
      reason: "Login cooldown is active.",
      action: "Cooldown",
      retryAt: user.cooldownUntil
    };
  }

  if (user?.captchaRequired && captchaToken !== captchaBypassToken) {
    return {
      allowed: false,
      statusCode: 403,
      reason: "CAPTCHA verification is required.",
      action: "CAPTCHA required"
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    reason: "Allowed",
    action: "Allow"
  };
}

async function recordFailedLogin({ identifier, ip, route = "/api/auth/login", userId }) {
  const failedAttempts = trackFailedLogin(identifier, ip);
  const policy = getLoginPolicy(failedAttempts);

  await SecurityLog.create({
    username: identifier || "unknown",
    userId,
    ip,
    route,
    method: "POST",
    status: "FAILED_LOGIN",
    statusCode: 401,
    threatScore: 20,
    threatLevel: "Warning",
    actionTaken: policy.action,
    details: {
      failedAttempts,
      policyLevel: policy.level
    }
  });

  if (failedAttempts === 4 || failedAttempts === 8 || failedAttempts === 12) {
    await createAlert({
      type: "Brute Force Attack",
      severity: failedAttempts >= 12 ? "Severe" : failedAttempts >= 8 ? "High" : "Medium",
      message: `${failedAttempts} failed login attempts detected for ${identifier || "unknown"}.`,
      actionTaken: policy.action,
      ip,
      userId
    });
  }

  return {
    failedAttempts,
    ...policy
  };
}

async function recordSuccessfulLogin({ identifier, ip, route = "/api/auth/login", userId, location }) {
  resetFailedLogins(identifier, ip);

  await SecurityLog.create({
    username: identifier || "unknown",
    userId,
    ip,
    location,
    route,
    method: "POST",
    status: "LOGIN_SUCCESS",
    statusCode: 200,
    threatScore: 0,
    threatLevel: "Safe",
    actionTaken: "Allow"
  });
}

module.exports = {
  getClientIp,
  getLoginPolicy,
  evaluateLoginDefense,
  recordFailedLogin,
  recordSuccessfulLogin
};
