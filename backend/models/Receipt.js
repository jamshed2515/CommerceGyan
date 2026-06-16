const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true, unique: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "FeePayment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    month: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    paymentMode: { type: String, required: true },
    referenceNumber: { type: String, default: "" },
    remainingBalance: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema, "receipts");
