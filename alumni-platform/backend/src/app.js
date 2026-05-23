const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const {
  createSecurityMonitor,
  securityDashboardRoutes
} = require("security-system");

const env = require("./config/env");
const User = require("./models/User");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const eventRoutes = require("./routes/event.routes");
const mentorshipRoutes = require("./routes/mentorship.routes");
const opportunityRoutes = require("./routes/opportunity.routes");
const announcementRoutes = require("./routes/announcement.routes");
const uploadRoutes = require("./routes/upload.routes");
const adminRoutes = require("./routes/admin.routes");
const { authenticate, requireRole } = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: true
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
  createSecurityMonitor({
    ignoredPaths: ["/health", "/uploads"]
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "secure-alumni-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use(
  "/api/security",
  authenticate,
  requireRole("admin"),
  securityDashboardRoutes({ userModel: User })
);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
