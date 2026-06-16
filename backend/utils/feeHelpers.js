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
      const allPaid = allStatements.every((s) => s.status === "Paid");
      const anyPaidOrPartial = allStatements.some((s) => s.paidAmount > 0);
      
      let newStatus = "Due";
      if (allPaid) {
        newStatus = "Paid";
      } else if (anyPaidOrPartial) {
        newStatus = "Partial";
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

module.exports = {
  autoGenerateStatementsForLedger,
};
