const { scoreEvents } = require("./threatScoring");

const INJECTION_PATTERNS = [
  /<script\b/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /union\s+select/i,
  /select\s+.*\s+from/i,
  /drop\s+table/i,
  /insert\s+into/i,
  /or\s+1\s*=\s*1/i,
  /\$\{.*\}/,
  /\.\.\/|\.\.\\/
];

function flattenValue(value, accumulator = []) {
  if (value === null || value === undefined) {
    return accumulator;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    accumulator.push(String(value));
    return accumulator;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => flattenValue(item, accumulator));
    return accumulator;
  }

  if (typeof value === "object") {
    Object.keys(value).forEach((key) => {
      accumulator.push(String(key));
      flattenValue(value[key], accumulator);
    });
  }

  return accumulator;
}

function inspectPayload(req) {
  const values = [
    ...flattenValue(req.body),
    ...flattenValue(req.query),
    ...flattenValue(req.params)
  ];

  const matches = [];

  values.forEach((value) => {
    INJECTION_PATTERNS.forEach((pattern) => {
      if (pattern.test(value)) {
        matches.push({
          pattern: pattern.toString(),
          sample: value.slice(0, 120)
        });
      }
    });
  });

  if (!matches.length) {
    return {
      suspicious: false,
      events: [],
      matches: [],
      score: 0
    };
  }

  return {
    suspicious: true,
    events: ["injectionAttempt"],
    matches,
    score: scoreEvents(["injectionAttempt"])
  };
}

module.exports = {
  inspectPayload
};
