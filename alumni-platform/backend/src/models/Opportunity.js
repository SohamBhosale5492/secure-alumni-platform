const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: String,
    resume: String,
    status: {
      type: String,
      enum: ["submitted", "reviewing", "shortlisted", "rejected"],
      default: "submitted"
    },
    appliedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["job", "internship"],
      default: "internship",
      index: true
    },
    company: { type: String, required: true },
    location: String,
    description: { type: String, required: true },
    skills: [{ type: String, trim: true }],
    applicationUrl: String,
    deadline: Date,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicants: [applicantSchema]
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Opportunity || mongoose.model("Opportunity", opportunitySchema);
