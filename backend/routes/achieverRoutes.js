const express = require("express");
const Achiever = require("../models/Achiever");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

// Get all active achievers (Public)
router.get("/", async (req, res) => {
  try {
    const achievers = await Achiever.find({ isActive: true }).sort({ rank: 1, year: -1 });
    res.json(achievers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all achievers including inactive (Admin only)
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const achievers = await Achiever.find().sort({ year: -1, rank: 1 });
    res.json(achievers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Create a new achiever (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, score, course, year, imageUrl, rank, isActive } = req.body;
    if (!name || !score) {
      return res.status(400).json({ message: "Name and score are required" });
    }
    const achiever = new Achiever({
      name,
      score,
      course: course || "Commerce",
      year: year || new Date().getFullYear().toString(),
      imageUrl: imageUrl || "",
      rank: rank !== undefined ? Number(rank) : 0,
      isActive: isActive !== undefined ? !!isActive : true,
    });
    await achiever.save();
    res.status(201).json({ message: "Achiever created successfully", achiever });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update an achiever (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, score, course, year, imageUrl, rank, isActive } = req.body;
    const achiever = await Achiever.findById(req.params.id);
    if (!achiever) {
      return res.status(404).json({ message: "Achiever not found" });
    }

    if (name !== undefined) achiever.name = name;
    if (score !== undefined) achiever.score = score;
    if (course !== undefined) achiever.course = course;
    if (year !== undefined) achiever.year = year;
    if (imageUrl !== undefined) achiever.imageUrl = imageUrl;
    if (rank !== undefined) achiever.rank = Number(rank);
    if (isActive !== undefined) achiever.isActive = !!isActive;

    await achiever.save();
    res.json({ message: "Achiever updated successfully", achiever });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete an achiever (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const achiever = await Achiever.findByIdAndDelete(req.params.id);
    if (!achiever) {
      return res.status(404).json({ message: "Achiever not found" });
    }
    res.json({ message: "Achiever deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
