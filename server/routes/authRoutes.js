const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  registerAdmin,
  loginUser,
  applyForAdmin,
} = require("../controllers/authController");

// ── Multer setup ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ── Existing routes (unchanged) ───────────────────────────────
router.post("/register", registerUser);
router.post("/register-admin", registerAdmin);
router.post("/login", loginUser);
router.post("/apply-admin", protect, applyForAdmin);

// ── New profile routes ────────────────────────────────────────
const User = require("../models/User"); // adjust if your model path differs

// GET /api/auth/me — fetch fresh user data
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/auth/update-profile — update name & email
router.put("/update-profile", protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/upload-avatar — upload profile photo
router.post("/upload-avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);

    // Delete old avatar from disk if one exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.avatar = `uploads/avatars/${req.file.filename}`;
    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;