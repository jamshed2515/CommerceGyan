const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// GET all students
router.get("/students", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT update student fee status
router.put("/students/:id/fee", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { feeStatus } = req.body;
    const student = await User.findByIdAndUpdate(req.params.id, { feeStatus }, { new: true }).select("-password");
    res.json({ message: "Fee status updated", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE student
router.delete("/students/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
