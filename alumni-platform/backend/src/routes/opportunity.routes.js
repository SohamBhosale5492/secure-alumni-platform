const express = require("express");
const { body } = require("express-validator");
const Opportunity = require("../models/Opportunity");
const { authenticate, requireRole } = require("../middleware/auth");
const validateRequest = require("../middleware/validate");

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("postedBy", "username email company")
      .populate("applicants.student", "username email")
      .sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireRole("alumni", "admin"),
  [
    body("title").trim().notEmpty(),
    body("company").trim().notEmpty(),
    body("description").trim().isLength({ min: 20 }),
    body("type").optional().isIn(["job", "internship"])
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const opportunity = await Opportunity.create({
        ...req.body,
        postedBy: req.user._id
      });

      res.status(201).json(opportunity);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:id/apply",
  requireRole("student", "admin"),
  [body("note").optional().trim()],
  validateRequest,
  async (req, res, next) => {
    try {
      const opportunity = await Opportunity.findById(req.params.id);

      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      const alreadyApplied = opportunity.applicants.some(
        (applicant) => String(applicant.student) === String(req.user._id)
      );

      if (!alreadyApplied) {
        opportunity.applicants.push({
          student: req.user._id,
          note: req.body.note,
          resume: req.user.resume
        });
        await opportunity.save();
      }

      return res.json(opportunity);
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
