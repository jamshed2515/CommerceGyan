const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_123456",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

// POST create order (protected student)
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount required" });
    const receipt = `rcpt_${Date.now()}`;
    const options = { amount: amount * 100, currency: "INR", receipt };
    const order = await razorpay.orders.create(options);

    // Save pending payment
    const user = await User.findById(req.user.id);
    const payment = new Payment({
      studentId: req.user.id,
      studentName: user ? user.name : "Student",
      amount,
      razorpayOrderId: order.id,
      status: "created",
      receipt,
    });
    await payment.save();

    res.json({ ...order, paymentDocId: payment._id, key: process.env.RAZORPAY_KEY_ID || "rzp_test_123456" });
  } catch (err) {
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

// POST verify payment
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDocId } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update payment doc
    await Payment.findByIdAndUpdate(paymentDocId, {
      razorpayPaymentId: razorpay_payment_id,
      status: "paid",
    });

    // Update user feeStatus
    await User.findByIdAndUpdate(req.user.id, { feeStatus: "paid" });

    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification error", error: err.message });
  }
});

// GET payment history for logged-in student
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET all payments (admin only)
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find().populate("studentId", "name email").sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
