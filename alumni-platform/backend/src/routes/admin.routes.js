const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const Event = require("../models/Event");
const MentorshipRequest = require("../models/MentorshipRequest");
const Opportunity = require("../models/Opportunity");
const SecurityLog = require("security-system/models/SecurityLog");
const SecurityAlert = require("security-system/models/SecurityAlert");
const BlockedIP = require("security-system/models/BlockedIP");
const { authenticate, requireRole } = require("../middleware/auth");
const validateRequest = require("../middleware/validate");

const router = express.Router();

router.use(authenticate, requireRole("admin"));

router.get("/overview", async (req, res, next) => {
  try {
    const [
      totalUsers,
      alumni,
      students,
      events,
      mentorshipRequests,
      opportunities,
      criticalAlerts,
      blockedIps
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "alumni" }),
      User.countDocuments({ role: "student" }),
      Event.countDocuments(),
      MentorshipRequest.countDocuments({ status: "pending" }),
      Opportunity.countDocuments(),
      SecurityAlert.countDocuments({
        acknowledged: false,
        severity: { $in: ["Severe", "Critical"] }
      }),
      BlockedIP.countDocuments({ blockedUntil: { $gt: new Date() } })
    ]);

    res.json({
      totalUsers,
      alumni,
      students,
      events,
      pendingMentorships: mentorshipRequests,
      opportunities,
      criticalAlerts,
      blockedIps
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 100);

    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/users/:id",
  [
    body("role").optional().isIn(["alumni", "student", "admin"]),
    body("status").optional().isIn(["active", "blocked", "pending"]),
    body("threatScore").optional().isInt({ min: 0, max: 100 })
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const isSelfUpdate = String(req.params.id) === String(req.user._id);

      if (
        isSelfUpdate &&
        ((req.body.role && req.body.role !== "admin") ||
          (req.body.status && req.body.status !== "active"))
      ) {
        return res.status(400).json({
          message: "Admins cannot remove their own admin access or block their own account."
        });
      }

      const allowedFields = ["role", "status", "threatScore"];
      const updates = {};

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
      }).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }
);

router.post("/users/:id/unblock", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "active";
    user.failedLoginCount = 0;
    user.captchaRequired = false;
    user.cooldownUntil = undefined;
    user.lockedUntil = undefined;
    user.threatScore = 0;
    await user.save({ validateBeforeSave: false });

    return res.json({
      message: "User security restrictions cleared.",
      user
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/recent-security-events", async (req, res, next) => {
  try {
    const logs = await SecurityLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
