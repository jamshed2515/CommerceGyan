const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateReceiptNumber } = require("../utils/feeHelpers");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_123456",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

// POST create order (protected student)
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount, ledgerId, month } = req.body;
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
      ledgerId: ledgerId || null,
      month: month || null,
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
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentDocId,
      { razorpayPaymentId: razorpay_payment_id, status: "paid" },
      { new: true }
    );

    // Update user feeStatus
    await User.findByIdAndUpdate(req.user.id, { feeStatus: "paid" });

    // Link online payment to FeeLedger and MonthlyFeeStatement if present
    if (updatedPayment && updatedPayment.ledgerId && updatedPayment.month) {
      const FeeLedger = require("../models/FeeLedger");
      const MonthlyFeeStatement = require("../models/MonthlyFeeStatement");
      const FeePayment = require("../models/FeePayment");
      const Receipt = require("../models/Receipt");

      const ledger = await FeeLedger.findById(updatedPayment.ledgerId);
      if (ledger) {
        const statement = await MonthlyFeeStatement.findOne({
          ledger: ledger._id,
          month: updatedPayment.month,
        });

        if (statement) {
          const payAmount = updatedPayment.amount;

          // 1. Create FeePayment transaction log
          const feePayment = new FeePayment({
            student: ledger.student,
            ledger: ledger._id,
            statement: statement._id,
            amount: payAmount,
            mode: "Razorpay",
            date: new Date(),
            reference: razorpay_payment_id || updatedPayment.razorpayOrderId,
            remarks: `Online Payment (Razorpay) for ${updatedPayment.month}.`,
            collectedBy: "Online Payment Gateway",
          });
          await feePayment.save();

          // 2. Update statement paidAmount
          statement.paidAmount += payAmount;
          statement.pendingAmount = Math.max(0, statement.dueAmount - statement.paidAmount);
          if (statement.pendingAmount === 0) {
            statement.status = "Paid";
          } else if (statement.paidAmount > 0) {
            statement.status = "Partial";
          } else {
            statement.status = "Due";
          }
          await statement.save();

          // 3. Update overall ledger status
          const allStatements = await MonthlyFeeStatement.find({ ledger: ledger._id });
          const allPaid = allStatements.every((s) => s.status === "Paid");
          const anyPaidOrPartial = allStatements.some((s) => s.paidAmount > 0);

          if (allPaid) {
            ledger.status = "Paid";
          } else if (anyPaidOrPartial) {
            ledger.status = "Partial";
          } else {
            ledger.status = "Due";
          }
          await ledger.save();

          // 4. Create printable digital Receipt
          const rNumber = await generateReceiptNumber(feePayment.date || new Date());
          const totalPendingAmount = allStatements.reduce((sum, s) => sum + s.pendingAmount, 0);

          const receipt = new Receipt({
            receiptNo: rNumber,
            payment: feePayment._id,
            student: ledger.student,
            course: ledger.course,
            month: updatedPayment.month,
            amountPaid: payAmount,
            paymentMode: "Razorpay",
            referenceNumber: razorpay_payment_id || "",
            remainingBalance: totalPendingAmount,
            date: feePayment.date,
          });
          await receipt.save();
        }
      }
    }

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
