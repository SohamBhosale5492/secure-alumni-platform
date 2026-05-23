const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const documentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: String,
    department: String,
    graduationYear: Number
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["alumni", "student", "admin"],
      default: "student",
      index: true
    },
    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "active"
    },
    profileImage: String,
    resume: String,
    documents: [documentSchema],
    education: [educationSchema],
    company: String,
    jobTitle: String,
    location: String,
    linkedIn: String,
    website: String,
    bio: { type: String, maxlength: 1000 },
    skills: [{ type: String, trim: true }],
    isMentor: { type: Boolean, default: false },
    mentorshipTopics: [{ type: String, trim: true }],
    threatScore: { type: Number, default: 0 },
    failedLoginCount: { type: Number, default: 0 },
    captchaRequired: { type: Boolean, default: false },
    cooldownUntil: Date,
    lockedUntil: Date,
    lastLoginAt: Date,
    lastLoginIp: String,
    lastLoginLocation: {
      city: String,
      country: String,
      source: String
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
