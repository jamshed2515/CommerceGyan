const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "commerce_giyan_secret";

// Register student
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, stream, className, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email, password: hashedPassword,
      phone: phone || "",
      stream: stream || "",
      className: className || "",
      address: address || "",
      role: "student",
    });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin login (checks against env vars OR DB role=admin)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if admin credentials match env
    const adminEmail = process.env.ADMIN_EMAIL || "admin@commercegiyan.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign({ id: "admin", role: "admin", name: "Admin" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        message: "Admin login successful",
        token,
        user: { id: "admin", name: "Admin", email: adminEmail, role: "admin" },
      });
    }

    // Student login
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get current user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.json({ id: "admin", name: "Admin", email: process.env.ADMIN_EMAIL, role: "admin" });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
