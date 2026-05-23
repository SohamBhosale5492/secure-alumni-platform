const express = require("express");
const { body } = require("express-validator");
const Event = require("../models/Event");
const { authenticate, requireRole } = require("../middleware/auth");
const validateRequest = require("../middleware/validate");

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "username email role")
      .populate("attendees", "username email role")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireRole("admin"),
  [
    body("title").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("date").isISO8601().toDate(),
    body("mode").optional().isIn(["online", "offline", "hybrid"])
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const event = await Event.create({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/:id/register", async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const alreadyRegistered = event.attendees.some(
      (attendeeId) => String(attendeeId) === String(req.user._id)
    );

    if (!alreadyRegistered) {
      event.attendees.push(req.user._id);
      await event.save();
    }

    return res.json(event);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
