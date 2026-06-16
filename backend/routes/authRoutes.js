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
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email, password: hashedPassword,
      phone: phone || "", stream: stream || "",
      className: className || "", address: address || "",
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

// Login (student + teacher share this endpoint; admin uses env credentials)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    // Admin env credentials check
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
    // DB user login (student or teacher)
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin || false,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── First-Time Password Setup ─────────────────────────────────────────────
// POST /api/auth/setup-password
// Called on first teacher login. Validates current (temp) password,
// sets new password, and clears isFirstLogin flag.
router.post("/setup-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }
    // Password strength validation
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strong.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current (temporary) password is incorrect" });
    // Prevent reuse of same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ message: "New password must be different from the current password" });
    user.password = await bcrypt.hash(newPassword, 10);
    user.isFirstLogin = false;
    await user.save();
    res.json({ message: "Password set successfully. Welcome to Commerce Gyan!" });
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
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("batch", "batchName timing teacher");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update profile (name, phone, address)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, subject } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (subject !== undefined) updates.subject = subject;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Change password (self-service from profile — works for all roles after first login)
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }
    // Password strength
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strong.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ message: "New password must be different from the current password" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
