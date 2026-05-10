const express = require("express");
const Announcement = require("../models/Announcement");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// GET all announcements (public)
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST create announcement (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, body, isImportant } = req.body;
    if (!title || !body) return res.status(400).json({ message: "Title and body required" });
    const ann = new Announcement({ title, body, isImportant: isImportant || false });
    await ann.save();
    res.status(201).json({ message: "Announcement created", announcement: ann });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT update announcement (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, body, isImportant } = req.body;
    const ann = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, body, isImportant },
      { new: true }
    );
    if (!ann) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated", announcement: ann });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE announcement (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
