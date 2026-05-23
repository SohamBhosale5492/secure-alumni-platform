const axios = require("axios");

const cache = new Map();

function isPrivateIp(ip) {
  return (
    !ip ||
    ip === "unknown" ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

async function lookupLocation(ip, providerUrl) {
  if (isPrivateIp(ip)) {
    return {
      city: "Local",
      country: "Private Network",
      source: "local"
    };
  }

  if (cache.has(ip)) {
    return cache.get(ip);
  }

  try {
    const url = providerUrl || `http://ip-api.com/json/${ip}?fields=status,country,city`;
    const { data } = await axios.get(url, { timeout: 1500 });

    const location = {
      city: data.city || "Unknown",
      country: data.country || "Unknown",
      source: "ip-api"
    };

    cache.set(ip, location);
    return location;
  } catch (error) {
    return {
      city: "Unknown",
      country: "Unknown",
      source: "unavailable"
    };
  }
}

module.exports = {
  lookupLocation
};
