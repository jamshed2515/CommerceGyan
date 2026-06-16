const express = require("express");
const Batch = require("../models/Batch");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// GET all batches (auth required)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("course", "title price")
      .populate("teacher", "name email subject phone")
      .populate("students", "name email className stream")
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET my batches (for logged-in teacher)
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const batches = await Batch.find({ teacher: req.user.id })
      .populate("course", "title price")
      .populate("teacher", "name email subject")
      .populate("students", "name email className stream");
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single batch by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("course", "title price description")
      .populate("teacher", "name email subject phone")
      .populate("students", "name email className stream phone");
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const batchPopulate = [
  { path: "course", select: "title price" },
  { path: "teacher", select: "name email subject phone" },
  { path: "students", select: "name email className stream" },
];

// POST create batch (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { batchName, course, teacher, timing, description } = req.body;
    if (!batchName || !course || !teacher || !timing) {
      return res.status(400).json({ message: "batchName, course, teacher, and timing are required" });
    }
    const batch = new Batch({ batchName, course, teacher, timing, description: description || "" });
    await batch.save();
    const populated = await batch.populate(batchPopulate);
    res.status(201).json({ message: "Batch created", batch: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT update batch (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { batchName, course, teacher, timing, description, isActive } = req.body;
    const update = {};
    if (batchName !== undefined) update.batchName = batchName;
    if (timing !== undefined) update.timing = timing;
    if (description !== undefined) update.description = description;
    if (isActive !== undefined) update.isActive = isActive;
    if (course !== undefined) update.course = course || null;
    if (teacher !== undefined) update.teacher = teacher || null;
    const batch = await Batch.findByIdAndUpdate(req.params.id, update, { new: true }).populate(batchPopulate);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json({ message: "Batch updated", batch });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE batch (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: "Batch deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST assign student to batch (admin only)
router.post("/:id/students", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { studentId } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    if (batch.students.includes(studentId)) {
      return res.status(400).json({ message: "Student already in this batch" });
    }
    batch.students.push(studentId);
    await batch.save();
    // Update student's legacy batch field and addToSet assignedBatches
    await User.findByIdAndUpdate(studentId, {
      batch: req.params.id,
      $addToSet: { assignedBatches: req.params.id }
    });
    res.json({ message: "Student assigned to batch", batch });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE remove student from batch (admin only)
router.delete("/:id/students/:studentId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Batch.findByIdAndUpdate(req.params.id, {
      $pull: { students: req.params.studentId },
    });
    // Pull from assignedBatches
    const student = await User.findByIdAndUpdate(
      req.params.studentId,
      { $pull: { assignedBatches: req.params.id } },
      { new: true }
    );
    if (student) {
      // If the removed batch was the legacy 'batch', update it to the first remaining assigned batch (or null)
      if (student.batch && student.batch.toString() === req.params.id) {
        student.batch = student.assignedBatches.length > 0 ? student.assignedBatches[0] : null;
        await student.save();
      }
    }
    res.json({ message: "Student removed from batch" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
