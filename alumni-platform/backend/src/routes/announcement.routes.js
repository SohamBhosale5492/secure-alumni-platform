const express = require("express");
const { body } = require("express-validator");
const Announcement = require("../models/Announcement");
const { authenticate, requireRole } = require("../middleware/auth");
const validateRequest = require("../middleware/validate");

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const announcements = await Announcement.find({
      audience: { $in: ["all", req.user.role] }
    })
      .populate("createdBy", "username role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(announcements);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireRole("admin"),
  [
    body("title").trim().notEmpty(),
    body("body").trim().isLength({ min: 10 }),
    body("audience").optional().isIn(["all", "alumni", "student", "admin"])
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const announcement = await Announcement.create({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json(announcement);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
