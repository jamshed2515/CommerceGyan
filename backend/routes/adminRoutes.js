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
    res.json({ students, teachers, batches, announcements, enquiries, totalFeeCollected, totalFeeDue, courses, achievers, paymentsCount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// CONSOLIDATED DASHBOARD ENDPOINT
// GET /api/admin/dashboard
// Returns ALL data in a single request.
// Replaces 11 individual fetches (students, teachers, batches,
// schedules, fees, courses, announcements, notes, enquiries,
// achievers, payments) + the /stats call.
// ─────────────────────────────────────────────
router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const Note = require("../models/Note");
    const Schedule = require("../models/Schedule");

    const [
      students, teachers, batches, schedules,
      fees, courses, announcements, notes,
      enquiries, achievers, payments,
    ] = await Promise.all([
      User.find({ role: "student" })
        .select("-password")
        .populate("batch", "batchName timing")
        .sort({ createdAt: -1 })
        .lean(),

      User.find({ role: "teacher" })
        .select("-password")
        .sort({ createdAt: -1 })
        .lean(),

      Batch.find()
        .populate("course", "title price")
        .populate("teacher", "name email subject phone")
        .populate("students", "name email className stream")
        .sort({ createdAt: -1 })
        .lean(),

      Schedule.find()
        .populate({ path: "batch", select: "batchName timing course", populate: { path: "course", select: "title" } })
        .populate("teacher", "name subject email phone")
        .sort({ dayOfWeek: 1, startTime: 1 })
        .lean(),

      Fee.find()
        .populate("student", "name email phone className stream")
        .populate("batch", "batchName timing")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .lean(),

      Course.find().sort({ createdAt: -1 }).lean(),

      Announcement.find().sort({ createdAt: -1 }).lean(),

      Note.find().sort({ createdAt: -1 }).lean(),

      Enquiry.find().sort({ createdAt: -1 }).lean(),

      Achiever.find().sort({ createdAt: -1 }).lean(),

      Payment.find().sort({ createdAt: -1 }).lean(),
    ]);

    // Computed stats (no extra DB round-trips — derived from data already fetched)
    const totalFeeCollected = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
    const totalFeeDue = fees.reduce((s, f) => s + (f.remainingAmount || 0), 0);
    const stats = {
      students: students.length,
      teachers: teachers.length,
      batches: batches.filter((b) => b.isActive !== false).length,
      announcements: announcements.length,
      enquiries: enquiries.filter((e) => e.status === "new").length,
      totalFeeCollected,
      totalFeeDue,
      courses: courses.length,
      achievers: achievers.length,
      paymentsCount: payments.length,
    };

    res.json({ stats, students, teachers, batches, schedules, fees, courses, announcements, notes, enquiries, achievers, payments });
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
      isFirstLogin: true, // Teacher must set own password on first login
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

// ─────────────────────────────────────────────
// ADMIN: RESET TEACHER PASSWORD
// PUT /api/admin/teachers/:id/reset-password
// Assigns a new temporary password and sets isFirstLogin = true
// ─────────────────────────────────────────────
router.put("/teachers/:id/reset-password", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { tempPassword } = req.body;
    if (!tempPassword || tempPassword.trim().length < 6) {
      return res.status(400).json({ message: "Temporary password must be at least 6 characters" });
    }
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }
    teacher.password = await bcrypt.hash(tempPassword.trim(), 10);
    teacher.isFirstLogin = true;
    await teacher.save();
    res.json({ message: `Password reset successfully. Teacher must set a new password on next login.` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// GLOBAL SEARCH
// GET /api/admin/search?q=query
// Searches students, teachers, courses, batches, schedules
// ─────────────────────────────────────────────
router.get("/search", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 1) return res.json({ students: [], teachers: [], courses: [], batches: [], schedules: [] });

    const Schedule = require("../models/Schedule");
    const Course = require("../models/Course");
    const regex = new RegExp(q, "i");

    const [students, teachers, courses, batches, schedules] = await Promise.all([
      User.find({ role: "student", $or: [{ name: regex }, { email: regex }, { phone: regex }, { className: regex }, { stream: regex }] })
        .select("name email phone className stream batch")
        .populate("batch", "batchName timing")
        .limit(6),

      User.find({ role: "teacher", $or: [{ name: regex }, { email: regex }, { phone: regex }, { subject: regex }] })
        .select("name email phone subject")
        .limit(6),

      Course.find({ $or: [{ title: regex }, { description: regex }, { category: regex }] })
        .select("title category price duration")
        .limit(6),

      require("../models/Batch").find({ $or: [{ batchName: regex }, { timing: regex }, { description: regex }] })
        .select("batchName timing isActive")
        .populate("course", "title")
        .populate("teacher", "name")
        .limit(6),

      Schedule.find({ $or: [{ subject: regex }, { dayOfWeek: regex }, { note: regex }] })
        .select("subject dayOfWeek startTime endTime")
        .populate("batch", "batchName")
        .populate("teacher", "name")
        .limit(6),
    ]);

    res.json({ students, teachers, courses, batches, schedules });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
