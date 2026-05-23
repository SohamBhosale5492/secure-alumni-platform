const express = require("express");
const { body, query } = require("express-validator");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const validateRequest = require("../middleware/validate");

const router = express.Router();

router.use(authenticate);

router.get(
  "/directory",
  [
    query("role").optional().isIn(["alumni", "student", "admin"]),
    query("mentor").optional().isBoolean(),
    query("search").optional().trim()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const filter = { status: "active" };

      if (req.query.role) {
        filter.role = req.query.role;
      }

      if (req.query.mentor === "true") {
        filter.isMentor = true;
      }

      if (req.query.search) {
        filter.$or = [
          { username: new RegExp(req.query.search, "i") },
          { company: new RegExp(req.query.search, "i") },
          { jobTitle: new RegExp(req.query.search, "i") },
          { skills: new RegExp(req.query.search, "i") }
        ];
      }

      const users = await User.find(filter)
        .select("-password -failedLoginCount -captchaRequired -cooldownUntil -lockedUntil")
        .sort({ username: 1 })
        .limit(100);

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/me/profile", async (req, res) => {
  res.json(req.user);
});

router.put(
  "/me/profile",
  [
    body("username").optional().trim().isLength({ min: 3 }),
    body("company").optional().trim(),
    body("jobTitle").optional().trim(),
    body("location").optional().trim(),
    body("linkedIn").optional().trim().isURL().withMessage("LinkedIn must be a URL."),
    body("website").optional().trim().isURL().withMessage("Website must be a URL."),
    body("bio").optional().trim().isLength({ max: 1000 }),
    body("skills").optional().isArray(),
    body("education").optional().isArray(),
    body("isMentor").optional().isBoolean(),
    body("mentorshipTopics").optional().isArray()
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const allowedFields = [
        "username",
        "company",
        "jobTitle",
        "location",
        "linkedIn",
        "website",
        "bio",
        "skills",
        "education",
        "isMentor",
        "mentorshipTopics"
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          req.user[field] = req.body[field];
        }
      });

      await req.user.save();
      res.json(req.user);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -failedLoginCount -captchaRequired -cooldownUntil -lockedUntil"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
