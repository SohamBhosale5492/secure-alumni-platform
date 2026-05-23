const express = require("express");
const { body } = require("express-validator");
const {
  evaluateLoginDefense,
  recordFailedLogin,
  recordSuccessfulLogin,
  getClientIp
} = require("security-system");

const User = require("../models/User");
const validateRequest = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { signToken } = require("../utils/token");
const env = require("../config/env");

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage,
    company: user.company,
    jobTitle: user.jobTitle,
    isMentor: user.isMentor,
    threatScore: user.threatScore
  };
}

router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters."),
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("role").optional().isIn(["alumni", "student", "admin"])
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const totalUsers = await User.countDocuments();
      const requestedRole = req.body.role || "student";
      const role = totalUsers === 0 ? "admin" : requestedRole === "admin" ? "student" : requestedRole;

      const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role
      });

      const token = signToken(user);

      res.status(201).json({
        token,
        user: publicUser(user),
        message: totalUsers === 0 ? "First account created as admin." : "Registration successful."
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
    body("captchaToken").optional().isString()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const { email, password, captchaToken } = req.body;
      const user = await User.findOne({ email }).select("+password");

      const defense = evaluateLoginDefense({
        user,
        captchaToken,
        captchaBypassToken: env.demoCaptchaToken
      });

      if (!defense.allowed) {
        return res.status(defense.statusCode).json({
          message: defense.reason,
          actionTaken: defense.action,
          retryAt: defense.retryAt
        });
      }

      if (!user || !(await user.comparePassword(password))) {
        const policy = await recordFailedLogin({
          identifier: email,
          ip,
          userId: user?._id
        });

        if (user) {
          user.failedLoginCount = policy.failedAttempts;
          user.threatScore = Math.min(100, user.threatScore + 20);
          user.captchaRequired = policy.captchaRequired;
          user.cooldownUntil = policy.cooldownUntil;
          user.lockedUntil = policy.lockedUntil;
          await user.save({ validateBeforeSave: false });
        }

        return res.status(401).json({
          message: "Invalid email or password.",
          failedAttempts: policy.failedAttempts,
          actionTaken: policy.action
        });
      }

      if (user.status !== "active") {
        return res.status(403).json({ message: "This account is not active." });
      }

      user.failedLoginCount = 0;
      user.captchaRequired = false;
      user.cooldownUntil = undefined;
      user.lockedUntil = undefined;
      user.lastLoginAt = new Date();
      user.lastLoginIp = ip;
      user.threatScore = Math.max(0, user.threatScore - 10);
      await user.save({ validateBeforeSave: false });

      await recordSuccessfulLogin({
        identifier: email,
        ip,
        userId: user._id
      });

      res.json({
        token: signToken(user),
        user: publicUser(user),
        message: "Login successful."
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "Logged out successfully." });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  validateRequest,
  async (req, res) => {
    res.json({
      message:
        "If an account exists for this email, a reset link would be sent by the configured mail provider."
    });
  }
);

module.exports = router;
