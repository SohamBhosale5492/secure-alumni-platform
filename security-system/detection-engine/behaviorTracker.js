const requestWindows = new Map();
const failedLoginWindows = new Map();
const uploadWindows = new Map();
const attackPatternWindows = new Map();

function pruneWindow(values, windowMs, now = Date.now()) {
  return values.filter((value) => now - value < windowMs);
}

function pushWindow(map, key, windowMs) {
  const now = Date.now();
  const current = pruneWindow(map.get(key) || [], windowMs, now);
  current.push(now);
  map.set(key, current);
  return current.length;
}

function resetWindow(map, key) {
  map.delete(key);
}

function trackRequest(ip, windowMs = 60 * 1000) {
  return pushWindow(requestWindows, ip, windowMs);
}

function trackFailedLogin(identifier, ip, windowMs = 15 * 60 * 1000) {
  const identityKey = `${identifier || "unknown"}:${ip}`;
  return pushWindow(failedLoginWindows, identityKey, windowMs);
}

function resetFailedLogins(identifier, ip) {
  resetWindow(failedLoginWindows, `${identifier || "unknown"}:${ip}`);
}

function trackUpload(ip, windowMs = 10 * 60 * 1000) {
  return pushWindow(uploadWindows, ip, windowMs);
}

function trackAttackPattern(ip, signature, windowMs = 60 * 60 * 1000) {
  const key = `${ip}:${signature}`;
  return pushWindow(attackPatternWindows, key, windowMs);
}

function getSnapshot() {
  return {
    trackedIps: requestWindows.size,
    trackedFailedLoginPairs: failedLoginWindows.size,
    trackedUploadIps: uploadWindows.size,
    trackedAttackPatterns: attackPatternWindows.size
  };
}

module.exports = {
  trackRequest,
  trackFailedLogin,
  resetFailedLogins,
  trackUpload,
  trackAttackPattern,
  getSnapshot
};
