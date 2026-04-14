const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint,
} = require("../controllers/complaintController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// User routes
router.post("/complaints", protect, createComplaint);
router.get("/complaints/my", protect, getMyComplaints);
router.put("/complaints/:id", protect, updateComplaint); // ✅ EDIT FIXED
router.delete("/complaints/:id", protect, deleteComplaint);

// Admin routes
router.get("/complaints", protect, adminOnly, getAllComplaints);
router.put("/complaints/status/:id", protect, adminOnly, updateComplaintStatus);

module.exports = router;