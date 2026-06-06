const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Batch = require("../models/Batch");
const Fee = require("../models/Fee");
const Announcement = require("../models/Announcement");
const Enquiry = require("../models/Enquiry");
const Course = require("../models/Course");
const Achiever = require("../models/Achiever");
const Payment = require("../models/Payment");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [students, teachers, batches, announcements, enquiries, fees, courses, achievers, paymentsCount] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      Batch.countDocuments({ isActive: true }),
      Announcement.countDocuments(),
      Enquiry.countDocuments({ status: "new" }),
      Fee.find(),
      Course.countDocuments(),
      Achiever.countDocuments(),
      Payment.countDocuments(),
    ]);
    const totalFeeCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const totalFeeDue = fees.reduce((sum, f) => sum + (f.remainingAmount || 0), 0);
    res.json({
      students,
      teachers,
      batches,
      announcements,
      enquiries,
      totalFeeCollected,
      totalFeeDue,
      courses,
      achievers,
      paymentsCount
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────
router.get("/students", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("batch", "batchName timing")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/students/:id/fee", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { feeStatus } = req.body;
    const student = await User.findByIdAndUpdate(req.params.id, { feeStatus }, { new: true }).select("-password");
    res.json({ message: "Fee status updated", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/students/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// TEACHERS
// ─────────────────────────────────────────────
router.get("/teachers", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/teachers", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, phone, subject, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new User({
      name, email, password: hashedPassword,
      phone: phone || "", subject: subject || "",
      address: address || "", role: "teacher",
    });
    await teacher.save();
    const { password: _, ...teacherData } = teacher.toObject();
    res.status(201).json({ message: "Teacher created", teacher: teacherData });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/teachers/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, phone, subject, address } = req.body;
    const teacher = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, subject, address },
      { new: true }
    ).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ message: "Teacher updated", teacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/teachers/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
