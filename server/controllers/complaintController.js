const Complaint = require("../models/Complaint");

// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      location, // ✅ FIXED
      user: req.user._id,
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL COMPLAINTS (Admin)
const getAllComplaints = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = req.query.status;
    const category = req.query.category;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate("user", "name email")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Complaint.countDocuments(query);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalComplaints: total,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY COMPLAINTS (User)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: UPDATE TITLE & DESCRIPTION
const updateComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only owner can edit
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;

    const updatedComplaint = await complaint.save();

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE STATUS (ADMIN)
const updateComplaintStatus = async (req, res) => {
  try {
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    status = status.trim();

    const validStatuses = ["Pending", "In Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;

    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
    });

    const updatedComplaint = await complaint.save();

    res.json({
      message: "Complaint status updated",
      updatedComplaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE COMPLAINT
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ FIXED: Only owner can delete
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await complaint.deleteOne();

    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint,
};