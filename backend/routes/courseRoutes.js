const express = require("express");
const Course = require("../models/Course");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Create a new course (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, targetAudience, price, isFeatured, syllabus } = req.body;
    if (!title || !description || !targetAudience || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const course = new Course({
      title,
      description,
      targetAudience,
      price,
      isFeatured: !!isFeatured,
      syllabus: Array.isArray(syllabus) ? syllabus : [],
    });
    await course.save();
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update a course (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, targetAudience, price, isFeatured, syllabus } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (targetAudience !== undefined) course.targetAudience = targetAudience;
    if (price !== undefined) course.price = price;
    if (isFeatured !== undefined) course.isFeatured = !!isFeatured;
    if (syllabus !== undefined) course.syllabus = Array.isArray(syllabus) ? syllabus : [];

    await course.save();
    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete a course (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Seed some initial data
router.post("/seed", async (req, res) => {
  try {
    const courses = [
      {
        title: "School Classes (7-10)",
        description: "Foundation building for classes 7, 8, 9, and 10.",
        targetAudience: "Class 7 to 10",
        price: 25000,
        isFeatured: true,
      },
      {
        title: "Commerce Classes (11-12)",
        description: "Expert coaching for Class 11 and 12 Commerce students.",
        targetAudience: "Class 11 to 12 Commerce",
        price: 35000,
        isFeatured: true,
      },
      {
        title: "Professional Courses",
        description: "B.Com, CA Foundation, CMA Foundation, CS Foundation",
        targetAudience: "Undergraduates & Professionals",
        price: 45000,
        isFeatured: true,
      }
    ];
    await Course.insertMany(courses);
    res.status(201).json({ message: "Courses seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
