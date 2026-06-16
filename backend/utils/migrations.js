const User = require("../models/User");
const FeeLedger = require("../models/FeeLedger");
const Enrollment = require("../models/Enrollment");
const MonthlyFeeStatement = require("../models/MonthlyFeeStatement");
const FeePayment = require("../models/FeePayment");
const Receipt = require("../models/Receipt");

const migrateRegistrationNumbers = async () => {
  const year = new Date().getFullYear() % 100; // e.g. 26 for 2026
  const prefix = `CGA${year}`;

  const studentsToMigrate = await User.find({
    role: "student",
    $or: [
      { registrationNumber: { $exists: false } },
      { registrationNumber: null },
      { registrationNumber: "" },
    ],
  }).sort({ createdAt: 1 });

  if (studentsToMigrate.length === 0) {
    console.log("[Migration] No students require registration number migration.");
    return;
  }

  console.log(`[Migration] Found ${studentsToMigrate.length} students without registration numbers. Migrating...`);

  // Find the highest existing registration number for this prefix to continue the sequence
  const lastStudent = await User.findOne({
    role: "student",
    registrationNumber: new RegExp(`^${prefix}`),
  }).sort({ registrationNumber: -1 });

  let nextNum = 1;
  if (lastStudent && lastStudent.registrationNumber) {
    const lastNumStr = lastStudent.registrationNumber.replace(prefix, "");
    const lastNum = parseInt(lastNumStr, 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  for (const student of studentsToMigrate) {
    const registrationNumber = `${prefix}${String(nextNum).padStart(4, "0")}`;
    student.registrationNumber = registrationNumber;

    // If the student doesn't have assignedBatches initialized but has a legacy batch, initialize it
    if (student.batch && (!student.assignedBatches || student.assignedBatches.length === 0)) {
      student.assignedBatches = [student.batch];
    }

    await student.save();
    console.log(`[Migration] Assigned ${registrationNumber} to student: ${student.name} (${student.email})`);
    nextNum++;
  }

  console.log("[Migration] Registration number migration complete.");
};

const migrateFeesToLedgers = async () => {
  try {
    const ledgerCount = await FeeLedger.countDocuments();
    if (ledgerCount > 0) {
      console.log("[Migration] FeeLedger documents already exist. Skipping fee migration.");
      return;
    }

    const Fee = require("../models/Fee");
    const oldFees = await Fee.find().lean();
    if (oldFees.length === 0) {
      console.log("[Migration] No legacy fees found to migrate.");
      return;
    }

    console.log(`[Migration] Found ${oldFees.length} legacy fee records to migrate.`);

    let migratedLedgersCount = 0;
    let migratedStatementsCount = 0;
    let migratedPaymentsCount = 0;
    let migratedReceiptsCount = 0;

    for (const f of oldFees) {
      if (!f.student) continue;

      let courseId = f.course;
      if (!courseId && f.batch) {
        const Batch = require("../models/Batch");
        const bDoc = await Batch.findById(f.batch).lean();
        if (bDoc && bDoc.course) {
          courseId = bDoc.course;
        }
      }

      if (!courseId) {
        console.warn(`[Migration] Legacy fee ${f._id} lacks course and batch. Skipping.`);
        continue;
      }

      // 1. Find or create enrollment
      let enrollment = await Enrollment.findOne({ student: f.student, course: courseId });
      if (!enrollment) {
        enrollment = new Enrollment({
          student: f.student,
          course: courseId,
          enrollmentDate: f.createdAt || new Date(),
          status: "Active"
        });
        await enrollment.save();
      }

      // 2. Create FeeLedger
      let feeLedger = await FeeLedger.findOne({ student: f.student, course: courseId });
      if (!feeLedger) {
        feeLedger = new FeeLedger({
          student: f.student,
          course: courseId,
          monthlyFee: f.totalFees || 0,
          discount: f.discount || 0,
          netMonthlyFee: f.netFee || 0,
          startDate: f.createdAt || new Date(),
          billingCycle: f.feeType || "monthly",
          status: f.status || "Due",
          notes: f.notes || ""
        });
        feeLedger._id = f._id;
        await feeLedger.save();
        migratedLedgersCount++;
      }

      // 3. Migrate statements
      const statementsMap = new Map();

      if (f.feeType === "monthly" && f.monthlyBills && f.monthlyBills.length > 0) {
        for (const bill of f.monthlyBills) {
          let stmt = await MonthlyFeeStatement.findOne({ ledger: feeLedger._id, month: bill.month });
          if (!stmt) {
            stmt = new MonthlyFeeStatement({
              ledger: feeLedger._id,
              student: f.student,
              course: courseId,
              month: bill.month,
              dueAmount: bill.amountDue || 0,
              paidAmount: bill.amountPaid || 0,
              pendingAmount: bill.pendingAmount || 0,
              dueDate: bill.dueDate || new Date(),
              status: bill.status || "Due"
            });
            if (bill._id) stmt._id = bill._id;
            await stmt.save();
            migratedStatementsCount++;
          }
          statementsMap.set(bill.month, stmt._id);
        }
      } else {
        const monthStr = new Date(f.createdAt || Date.now()).toLocaleString("en-IN", { month: "long", year: "numeric" });
        let stmt = await MonthlyFeeStatement.findOne({ ledger: feeLedger._id, month: monthStr });
        if (!stmt) {
          stmt = new MonthlyFeeStatement({
            ledger: feeLedger._id,
            student: f.student,
            course: courseId,
            month: monthStr,
            dueAmount: f.netFee || 0,
            paidAmount: f.paidAmount || 0,
            pendingAmount: f.remainingAmount || 0,
            dueDate: f.createdAt || new Date(),
            status: f.status || "Due"
          });
          await stmt.save();
          migratedStatementsCount++;
        }
        statementsMap.set(monthStr, stmt._id);
      }

      // 4. Migrate payments & receipts
      if (f.payments && f.payments.length > 0) {
        const paymentsSorted = [...f.payments].sort((a, b) => new Date(a.date) - new Date(b.date));

        for (const p of paymentsSorted) {
          const existingPayment = await FeePayment.findOne({
            student: f.student,
            ledger: feeLedger._id,
            amount: p.amount,
            date: p.date,
            mode: p.mode
          });

          if (!existingPayment) {
            let targetStatementId = null;
            let targetMonth = null;

            if (f.feeType === "monthly") {
              const matchedMonth = Array.from(statementsMap.keys()).find(m => p.remarks && p.remarks.includes(m));
              if (matchedMonth) {
                targetStatementId = statementsMap.get(matchedMonth);
                targetMonth = matchedMonth;
              } else {
                const firstMonth = Array.from(statementsMap.keys())[0];
                targetStatementId = statementsMap.get(firstMonth);
                targetMonth = firstMonth;
              }
            } else {
              const firstMonth = Array.from(statementsMap.keys())[0];
              targetStatementId = statementsMap.get(firstMonth);
              targetMonth = firstMonth;
            }

            if (!targetStatementId) continue;

            const feePayment = new FeePayment({
              student: f.student,
              ledger: feeLedger._id,
              statement: targetStatementId,
              amount: p.amount,
              mode: p.mode,
              date: p.date,
              reference: p.reference || "",
              remarks: p.remarks || "",
              collectedBy: p.collectedBy || "Admin"
            });
            if (p._id) feePayment._id = p._id;
            await feePayment.save();
            migratedPaymentsCount++;

            const existingReceipt = await Receipt.findOne({ payment: feePayment._id });
            if (!existingReceipt) {
              const yPrefix = new Date(p.date).getFullYear().toString().slice(-2);
              const rNumber = `REC${yPrefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

              const receipt = new Receipt({
                receiptNo: rNumber,
                payment: feePayment._id,
                student: f.student,
                course: courseId,
                month: targetMonth || "Statement",
                amountPaid: p.amount,
                paymentMode: p.mode,
                referenceNumber: p.reference || "",
                remainingBalance: f.remainingAmount || 0,
                date: p.date
              });
              await receipt.save();
              migratedReceiptsCount++;
            }
          }
        }
      }
    }

    console.log(`[Migration] Legacy fee migration finished:
      - Ledgers: ${migratedLedgersCount} created
      - Monthly Statements: ${migratedStatementsCount} created
      - Payments: ${migratedPaymentsCount} created
      - Receipts: ${migratedReceiptsCount} created`);
  } catch (err) {
    console.error("[Migration] Error migrating legacy fees:", err);
  }
};

module.exports = { migrateRegistrationNumbers, migrateFeesToLedgers };
