const mongoose = require("mongoose");

const monthlyFeeStatementSchema = new mongoose.Schema(
  {
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "FeeLedger", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    month: { type: String, required: true }, // e.g. "June 2026"
    dueAmount: { type: Number, required: true }, // netMonthlyFee or total standard monthly fee
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true }, // dueAmount - paidAmount
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Upcoming", "Due", "Partial", "Paid", "Overdue"],
      default: "Due",
    },
  },
  { timestamps: true }
);

// Auto-calculate pendingAmount and status prior to saving
monthlyFeeStatementSchema.pre("save", function () {
  this.pendingAmount = Math.max(0, this.dueAmount - (this.paidAmount || 0));
  
  if (this.paidAmount >= this.dueAmount) {
    this.status = "Paid";
  } else if (this.paidAmount > 0) {
    this.status = "Partial";
  } else {
    // Check if it's past due date
    const now = new Date();
    // Compare date components only, ignoring hours
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const stmtDueDate = new Date(this.dueDate);
    const formattedDueDate = new Date(stmtDueDate.getFullYear(), stmtDueDate.getMonth(), stmtDueDate.getDate());
    
    if (formattedDueDate < todayDate) {
      this.status = "Overdue";
    } else {
      this.status = "Due";
    }
  }
});

// Compound index to prevent duplicate monthly statements for same ledger + month
monthlyFeeStatementSchema.index({ ledger: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyFeeStatement", monthlyFeeStatementSchema);
