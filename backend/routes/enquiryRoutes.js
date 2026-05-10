const express = require("express");
const nodemailer = require("nodemailer");
const Enquiry = require("../models/Enquiry");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_APP_PASSWORD,
  },
});

// POST submit enquiry (public)
router.post("/", async (req, res) => {
  try {
    const { studentName, parentName, parentPhone, email, stream, className, address, message } = req.body;
    if (!studentName || !parentName || !parentPhone || !email || !stream || !className) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Save to DB
    const enquiry = new Enquiry({ studentName, parentName, parentPhone, email, stream, className, address, message });
    await enquiry.save();

    // Send admin email
    const adminMail = {
      from: `"Commerce Giyan Website" <${process.env.NODEMAILER_EMAIL}>`,
      to: process.env.ADMIN_EMAIL || "commercegiyan@gmail.com",
      subject: `📩 New Admission Enquiry — ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #1A3B70; padding: 20px; text-align: center;">
            <h2 style="color: #FFCC00; margin: 0;">Commerce Giyan</h2>
            <p style="color: white; margin: 5px 0 0;">New Admission Enquiry Received</p>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold; color: #1A3B70; width: 40%;">Student Name</td><td style="padding: 8px;">${studentName}</td></tr>
              <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Parent Name</td><td style="padding: 8px;">${parentName}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Parent Phone</td><td style="padding: 8px;"><a href="tel:${parentPhone}">${parentPhone}</a></td></tr>
              <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Email</td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Stream</td><td style="padding: 8px;">${stream}</td></tr>
              <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Class / Course</td><td style="padding: 8px;">${className}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Address</td><td style="padding: 8px;">${address || "—"}</td></tr>
              <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Message</td><td style="padding: 8px;">${message || "—"}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #1A3B70;">Date & Time</td><td style="padding: 8px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 12px; background: #E6F4FE; border-radius: 6px; border-left: 4px solid #00AEEF;">
              <p style="margin: 0; color: #1A3B70; font-size: 14px;">📞 Call back on: <strong>${parentPhone}</strong> or reply to this email.</p>
            </div>
          </div>
          <div style="background: #f5f5f5; padding: 12px; text-align: center; font-size: 12px; color: #888;">
            Commerce Giyan | Katrasgarh, Jharkhand | 8271365450
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(adminMail);
    } catch (mailErr) {
      console.error("Email send error:", mailErr.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({ message: "Enquiry submitted successfully", enquiry });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET all enquiries (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT update enquiry status (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: "Status updated", enquiry });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
