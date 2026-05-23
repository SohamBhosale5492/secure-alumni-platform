const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const { secureFileFilter } = require("security-system");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

const uploadRoot = path.join(__dirname, "../../uploads");
const profileDir = path.join(uploadRoot, "profile-images");
const documentDir = path.join(uploadRoot, "documents");

[uploadRoot, profileDir, documentDir].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "profileImage") {
      return cb(null, profileDir);
    }

    return cb(null, documentDir);
  },
  filename(req, file, cb) {
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9_-]/gi, "-")
      .slice(0, 40);
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `${req.user._id}-${Date.now()}-${safeBaseName}${extension}`);
  }
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: secureFileFilter(["image/jpeg", "image/png", "image/webp"])
});

const documentUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: secureFileFilter([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ])
});

function runUpload(uploadMiddleware) {
  return function uploadRunner(req, res, next) {
    uploadMiddleware(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message || "File upload failed."
        });
      }

      return next();
    });
  };
}

router.post(
  "/profile-image",
  runUpload(imageUpload.single("profileImage")),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Profile image is required." });
      }

      req.user.profileImage = `/uploads/profile-images/${req.file.filename}`;
      await req.user.save({ validateBeforeSave: false });

      return res.json({
        message: "Profile image uploaded.",
        profileImage: req.user.profileImage
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/resume",
  runUpload(documentUpload.single("resume")),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Resume file is required." });
      }

      req.user.resume = `/uploads/documents/${req.file.filename}`;
      await req.user.save({ validateBeforeSave: false });

      return res.json({
        message: "Resume uploaded.",
        resume: req.user.resume
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/documents",
  runUpload(documentUpload.single("document")),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Document file is required." });
      }

      const document = {
        name: req.file.originalname,
        url: `/uploads/documents/${req.file.filename}`,
        mimeType: req.file.mimetype
      };

      req.user.documents.push(document);
      await req.user.save({ validateBeforeSave: false });

      return res.status(201).json({
        message: "Document uploaded.",
        document
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
