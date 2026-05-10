const express = require("express");
const Course = require("../models/Course");
const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
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
