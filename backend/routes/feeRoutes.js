const express = require("express");
const Fee = require("../models/Fee");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// GET all fee records (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate("student", "name email phone className stream")
      .populate("batch", "batchName timing")
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET current student's fee records
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.user.id })
      .populate("batch", "batchName timing")
      .populate("course", "title");
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single fee record
router.get("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate("student", "name email")
      .populate("batch", "batchName")
      .populate("course", "title");
    if (!fee) return res.status(404).json({ message: "Fee record not found" });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST create fee record (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { student, batch, course, totalFees, paidAmount, notes } = req.body;
    if (!student || !batch || !totalFees) {
      return res.status(400).json({ message: "student, batch, and totalFees are required" });
    }
    // Check if record already exists for this student+batch
    const existing = await Fee.findOne({ student, batch });
    if (existing) {
      return res.status(400).json({ message: "Fee record already exists for this student in this batch" });
    }
    const fee = new Fee({ student, batch, course, totalFees, paidAmount: paidAmount || 0, notes });
    await fee.save();
    const populated = await fee.populate("student batch course");
    res.status(201).json({ message: "Fee record created", fee: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT update fee paid amount (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { paidAmount, notes } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });
    if (paidAmount !== undefined) fee.paidAmount = paidAmount;
    if (notes !== undefined) fee.notes = notes;
    await fee.save(); // triggers pre-save hook for status/remaining calc
    const populated = await fee.populate("student batch course");
    res.json({ message: "Fee record updated", fee: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE fee record (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: "Fee record deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
