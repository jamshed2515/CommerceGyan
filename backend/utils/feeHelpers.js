const FeeLedger = require("../models/FeeLedger");
const MonthlyFeeStatement = require("../models/MonthlyFeeStatement");
const Enrollment = require("../models/Enrollment");

const autoGenerateStatementsForLedger = async (ledger) => {
  try {
    const studentId = ledger.student._id || ledger.student;
    const courseId = ledger.course._id || ledger.course;

    // Find enrollment to get enrollment date & status
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) return; // Only generate statements for enrolled courses

    // Enrollment start date
    const start = enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate) : new Date(ledger.startDate || ledger.createdAt);
    const end = new Date(); // current date

    // Loop month-by-month from start to end (current month)
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const targetEnd = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= targetEnd) {
      const monthStr = current.toLocaleString("en-US", { month: "long", year: "numeric" }); // e.g. "June 2026"
      
      // Check if statement already exists
      const exists = await MonthlyFeeStatement.findOne({ ledger: ledger._id, month: monthStr });
      if (!exists) {
        // Create statement
        const dueDate = new Date(current.getFullYear(), current.getMonth(), 10); // 10th of that month
        const statement = new MonthlyFeeStatement({
          ledger: ledger._id,
          student: studentId,
          course: courseId,
          month: monthStr,
          dueAmount: ledger.netMonthlyFee,
          paidAmount: 0,
          pendingAmount: ledger.netMonthlyFee,
          dueDate,
          status: "Due",
        });
        await statement.save();
      } else {
        // If it exists, but the due date has passed and status is still "Due", let's update it to "Overdue"
        const now = new Date();
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (exists.pendingAmount > 0 && new Date(exists.dueDate) < todayDate && exists.status === "Due") {
          exists.status = "Overdue";
          await exists.save();
        }
      }
      
      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    // Recalculate ledger status based on all statements
    const allStatements = await MonthlyFeeStatement.find({ ledger: ledger._id });
    if (allStatements.length > 0) {
      const now = new Date();
      const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

      const parseMonthStr = (monthStr) => {
        const parts = monthStr.split(" ");
        if (parts.length === 2) {
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const mIdx = monthNames.indexOf(parts[0]);
          const year = parseInt(parts[1], 10);
          if (mIdx !== -1 && !isNaN(year)) {
            return new Date(year, mIdx, 1);
          }
        }
        return new Date();
      };

      let hasOverduePrevious = false;
      let currentMonthStmt = null;

      allStatements.forEach((s) => {
        const sDate = parseMonthStr(s.month);
        if (sDate < currentMonthDate) {
          if (s.pendingAmount > 0) {
            hasOverduePrevious = true;
          }
        } else if (sDate.getTime() === currentMonthDate.getTime()) {
          currentMonthStmt = s;
        }
      });

      let newStatus = "GOOD STANDING";

      if (hasOverduePrevious) {
        newStatus = "OVERDUE";
      } else if (currentMonthStmt) {
        if (currentMonthStmt.pendingAmount === 0) {
          newStatus = "GOOD STANDING";
        } else if (currentMonthStmt.paidAmount > 0) {
          newStatus = "PARTIALLY PAID";
        } else {
          newStatus = "DUE THIS MONTH";
        }
      } else {
        const pastStmts = allStatements.filter(s => parseMonthStr(s.month) < currentMonthDate);
        if (pastStmts.length > 0) {
          const allPastPaid = pastStmts.every(s => s.pendingAmount === 0);
          newStatus = allPastPaid ? "GOOD STANDING" : "OVERDUE";
        } else {
          newStatus = "GOOD STANDING";
        }
      }

      if (ledger.status !== newStatus) {
        ledger.status = newStatus;
        await ledger.save();
      }
    }
  } catch (err) {
    console.error("Error in autoGenerateStatementsForLedger helper:", err);
  }
};

const Counter = require("../models/Counter");

const generateReceiptNumber = async (date = new Date()) => {
  const year = new Date(date).getFullYear();
  const sequenceName = `receipt_${year}`;
  
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  const paddedSeq = String(counter.seq).padStart(6, "0");
  return `CG-REC-${year}-${paddedSeq}`;
};

module.exports = {
  autoGenerateStatementsForLedger,
  generateReceiptNumber,
};
