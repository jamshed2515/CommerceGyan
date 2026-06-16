const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Razorpay"], required: true },
    reference: { type: String, default: "" },
    collectedBy: { type: String, default: "Admin" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

const monthlyBillSchema = new mongoose.Schema(
  {
    month: { type: String, required: true }, // e.g. "June 2026"
    standardFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    amountDue: { type: Number, required: true }, // net due = standardFee - discount
    amountPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Due", "Overdue"],
      default: "Due"
    }
  },
  { timestamps: true }
);

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    feeType: { type: String, enum: ["one_time", "monthly"], default: "one_time" },
    totalFees: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    netFee: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Due"],
      default: "Due",
    },
    payments: [paymentHistorySchema],
    monthlyBills: [monthlyBillSchema],
    initialPaymentMode: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Razorpay"], default: "Cash" },
    lastUpdated: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-calculate netFee, paidAmount, remainingAmount and status before every save
feeSchema.pre("save", function () {
  if (this.feeType === "monthly") {
    // 1. Calculate each monthly bill net/pending/status
    if (this.monthlyBills && this.monthlyBills.length > 0) {
      this.monthlyBills.forEach((bill) => {
        bill.amountDue = Math.max(0, bill.standardFee - (bill.discount || 0));
        bill.pendingAmount = Math.max(0, bill.amountDue - (bill.amountPaid || 0));
        
        if (bill.amountPaid >= bill.amountDue) {
          bill.status = "Paid";
        } else if (bill.amountPaid > 0) {
          bill.status = "Partial";
        } else {
          const now = new Date();
          if (bill.dueDate && now > new Date(bill.dueDate)) {
            bill.status = "Overdue";
          } else {
            bill.status = "Due";
          }
        }
      });

      // 2. Aggregate parent ledger details from monthly bills
      this.totalFees = this.monthlyBills.reduce((sum, b) => sum + b.standardFee, 0);
      this.discount = this.monthlyBills.reduce((sum, b) => sum + b.discount, 0);
      this.netFee = this.monthlyBills.reduce((sum, b) => sum + b.amountDue, 0);
      this.paidAmount = this.monthlyBills.reduce((sum, b) => sum + b.amountPaid, 0);
    } else {
      this.totalFees = 0;
      this.discount = 0;
      this.netFee = 0;
      this.paidAmount = 0;
    }
    
    this.remainingAmount = Math.max(0, this.netFee - this.paidAmount);
    
    // Overall ledger status for monthly
    if (this.monthlyBills && this.monthlyBills.length > 0) {
      const allPaid = this.monthlyBills.every(b => b.status === "Paid");
      const anyPaidOrPartial = this.monthlyBills.some(b => b.amountPaid > 0);
      if (allPaid) {
        this.status = "Paid";
      } else if (anyPaidOrPartial) {
        this.status = "Partial";
      } else {
        this.status = "Due";
      }
    } else {
      this.status = "Due";
    }
  } else {
    // one_time course ledger calculations (original logic)
    this.netFee = Math.max(0, this.totalFees - (this.discount || 0));

    // If initial paidAmount is passed but payments is empty, seed initial payment history entry
    if (this.payments.length === 0 && this.paidAmount > 0) {
      this.payments.push({
        date: new Date(),
        amount: this.paidAmount,
        mode: this.initialPaymentMode || "Cash",
        reference: "Initial Payment",
        collectedBy: "Admin",
        remarks: "Logged on ledger creation",
      });
    }

    // Calculate sum of payments as paidAmount
    if (this.payments && this.payments.length > 0) {
      this.paidAmount = this.payments.reduce((sum, p) => sum + p.amount, 0);
    } else {
      this.paidAmount = 0;
    }

    this.remainingAmount = Math.max(0, this.netFee - this.paidAmount);

    if (this.paidAmount >= this.netFee) {
      this.status = "Paid";
    } else if (this.paidAmount > 0) {
      this.status = "Partial";
    } else {
      this.status = "Due";
    }
  }

  this.lastUpdated = new Date();
});

// Post-save hook to sync student's feeStatus in User model
feeSchema.post("save", async function (doc) {
  try {
    const User = mongoose.model("User");
    const Fee = mongoose.model("Fee");
    const studentLedgers = await Fee.find({ student: doc.student });
    let overallStatus = "paid";
    if (studentLedgers.some((l) => l.status === "Due")) {
      overallStatus = "due";
    } else if (studentLedgers.some((l) => l.status === "Partial")) {
      overallStatus = "partial";
    }
    await User.findByIdAndUpdate(doc.student, { feeStatus: overallStatus });
  } catch (err) {
    console.error("Error syncing student overall feeStatus:", err);
  }
});

module.exports = mongoose.model("Fee", feeSchema);
