const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "FeeLedger", required: true },
    statement: { type: mongoose.Schema.Types.ObjectId, ref: "MonthlyFeeStatement", required: true },
    amount: { type: Number, required: true },
    mode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Razorpay"],
      required: true,
    },
    date: { type: Date, default: Date.now },
    reference: { type: String, default: "" },
    remarks: { type: String, default: "" },
    collectedBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

// Map strictly to the 'payments' collection in MongoDB as requested
module.exports = mongoose.model("FeePayment", feePaymentSchema, "payments");
