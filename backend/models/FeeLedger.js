const mongoose = require("mongoose");

const feeLedgerSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    monthlyFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    netMonthlyFee: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    billingCycle: { type: String, default: "monthly" },
    status: {
      type: String,
      enum: ["GOOD STANDING", "PARTIALLY PAID", "DUE THIS MONTH", "OVERDUE", "Paid", "Partial", "Due"],
      default: "DUE THIS MONTH",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent duplicate ledger for same student + course
feeLedgerSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("FeeLedger", feeLedgerSchema);
