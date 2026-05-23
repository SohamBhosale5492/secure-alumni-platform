const express = require("express");
const { body } = require("express-validator");
const MentorshipRequest = require("../models/MentorshipRequest");
const User = require("../models/User");
const { authenticate, requireRole } = require("../middleware/auth");
const validateRequest = require("../middleware/validate");

const router = express.Router();

router.use(authenticate);

router.get("/mentors", async (req, res, next) => {
  try {
    const mentors = await User.find({
      role: "alumni",
      isMentor: true,
      status: "active"
    }).select("username email company jobTitle location skills mentorshipTopics profileImage");

    res.json(mentors);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : {
            $or: [{ mentor: req.user._id }, { student: req.user._id }]
          };

    const requests = await MentorshipRequest.find(filter)
      .populate("mentor", "username email company jobTitle")
      .populate("student", "username email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireRole("student", "admin"),
  [
    body("mentor").isMongoId().withMessage("A valid mentor is required."),
    body("goals").trim().isLength({ min: 10 }).withMessage("Goals must be at least 10 characters.")
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const mentor = await User.findOne({
        _id: req.body.mentor,
        role: "alumni",
        isMentor: true
      });

      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }

      const request = await MentorshipRequest.create({
        mentor: mentor._id,
        student: req.user._id,
        goals: req.body.goals,
        preferredSchedule: req.body.preferredSchedule
      });

      return res.status(201).json(request);
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/:id/status",
  requireRole("admin", "alumni"),
  [body("status").isIn(["approved", "rejected", "active", "completed"])],
  validateRequest,
  async (req, res, next) => {
    try {
      const request = await MentorshipRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Mentorship request not found" });
      }

      if (
        req.user.role !== "admin" &&
        String(request.mentor) !== String(req.user._id)
      ) {
        return res.status(403).json({ message: "Only the assigned mentor or admin can update this." });
      }

      request.status = req.body.status;
      request.adminNote = req.body.adminNote;
      await request.save();

      return res.json(request);
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
