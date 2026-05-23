const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../../.env")
});

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  useMemoryDb: process.env.USE_MEMORY_DB === "true",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  demoCaptchaToken: process.env.DEMO_CAPTCHA_TOKEN || "demo-pass"
};

module.exports = env;
