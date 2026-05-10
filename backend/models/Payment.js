const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String },
    amount: { type: Number, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    receipt: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
