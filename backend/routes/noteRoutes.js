const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// GET all notes (logged-in students)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST upload note (admin only)
router.post("/", authMiddleware, adminMiddleware, upload.single("pdf"), async (req, res) => {
  try {
    const { title, subject, className, course } = req.body;
    if (!req.file) return res.status(400).json({ message: "PDF file required" });
    const note = new Note({
      title,
      subject,
      className,
      course: course || "",
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
    });
    await note.save();
    res.status(201).json({ message: "Note uploaded", note });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE note (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    // Delete file from disk
    const filePath = path.join(__dirname, "../", note.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
