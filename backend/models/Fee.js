const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    totalFees: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Unpaid", "PartialPaid", "Paid"],
      default: "Unpaid",
    },
    lastUpdated: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-calculate remaining and status before every save
feeSchema.pre("save", function (next) {
  this.remainingAmount = Math.max(0, this.totalFees - this.paidAmount);
  if (this.paidAmount >= this.totalFees) {
    this.status = "Paid";
  } else if (this.paidAmount > 0) {
    this.status = "PartialPaid";
  } else {
    this.status = "Unpaid";
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("Fee", feeSchema);
