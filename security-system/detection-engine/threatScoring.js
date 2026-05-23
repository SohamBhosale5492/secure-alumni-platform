const ACTIVITY_SCORES = {
  failedLogin: 20,
  suspiciousIp: 30,
  apiAbuse: 40,
  dangerousUpload: 50,
  injectionAttempt: 45,
  repeatedAttackPattern: 60
};

function clampScore(score) {
  return Math.max(0, Math.min(100, Number(score) || 0));
}

function getThreatLevel(score) {
  const normalized = clampScore(score);

  if (normalized <= 30) {
    return "Safe";
  }

  if (normalized <= 60) {
    return "Warning";
  }

  return "Dangerous";
}

function getProgressiveAction(score) {
  const normalized = clampScore(score);

  if (normalized >= 90) {
    return "Temporary IP block";
  }

  if (normalized >= 75) {
    return "Temporary account lock";
  }

  if (normalized >= 60) {
    return "CAPTCHA required";
  }

  if (normalized >= 35) {
    return "Cooldown";
  }

  if (normalized > 0) {
    return "Warning";
  }

  return "Allow";
}

function scoreEvents(events = []) {
  return clampScore(
    events.reduce((total, eventName) => total + (ACTIVITY_SCORES[eventName] || 0), 0)
  );
}

module.exports = {
  ACTIVITY_SCORES,
  clampScore,
  getThreatLevel,
  getProgressiveAction,
  scoreEvents
};
