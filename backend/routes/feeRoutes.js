const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const FeeLedger = require("../models/FeeLedger");
const MonthlyFeeStatement = require("../models/MonthlyFeeStatement");
const FeePayment = require("../models/FeePayment");
const Receipt = require("../models/Receipt");
const Enrollment = require("../models/Enrollment");
const { autoGenerateStatementsForLedger } = require("../utils/feeHelpers");

const router = express.Router();

// GET all fee ledgers (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ledgers = await FeeLedger.find()
      .populate("student", "name email phone className stream registrationNumber")
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    const populatedLedgers = await Promise.all(
      ledgers.map(async (l) => {
        await autoGenerateStatementsForLedger(l);
        const statements = await MonthlyFeeStatement.find({ ledger: l._id }).sort({ dueDate: 1 });
        const payments = await FeePayment.find({ ledger: l._id }).populate("statement").sort({ date: -1 });

        const totalFees = statements.reduce((sum, s) => sum + s.dueAmount, 0);
        const paidAmount = statements.reduce((sum, s) => sum + s.paidAmount, 0);
        const remainingAmount = statements.reduce((sum, s) => sum + s.pendingAmount, 0);
        const discount = l.discount || 0;
        const netFee = totalFees - discount;

        return {
          ...l.toObject(),
          totalFees,
          paidAmount,
          remainingAmount,
          discount,
          netFee,
          monthlyBills: statements,
          payments,
        };
      })
    );

    res.json(populatedLedgers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET current student's fee ledgers with monthly statements
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const ledgers = await FeeLedger.find({ student: req.user.id })
      .populate("student", "name email phone className stream registrationNumber")
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    const populatedLedgers = await Promise.all(
      ledgers.map(async (l) => {
        await autoGenerateStatementsForLedger(l);
        const statements = await MonthlyFeeStatement.find({ ledger: l._id }).sort({ dueDate: 1 });
        const payments = await FeePayment.find({ ledger: l._id }).populate("statement").sort({ date: -1 });

        const totalFees = statements.reduce((sum, s) => sum + s.dueAmount, 0);
        const paidAmount = statements.reduce((sum, s) => sum + s.paidAmount, 0);
        const remainingAmount = statements.reduce((sum, s) => sum + s.pendingAmount, 0);
        const discount = l.discount || 0;
        const netFee = totalFees - discount;

        return {
          ...l.toObject(),
          totalFees,
          paidAmount,
          remainingAmount,
          discount,
          netFee,
          monthlyBills: statements,
          payments,
        };
      })
    );

    res.json(populatedLedgers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single fee record details
router.get("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const l = await FeeLedger.findById(req.params.id)
      .populate("student", "name email phone className stream registrationNumber")
      .populate("course", "title price");
    
    if (!l) return res.status(404).json({ message: "Fee ledger not found" });

    await autoGenerateStatementsForLedger(l);
    const statements = await MonthlyFeeStatement.find({ ledger: l._id }).sort({ dueDate: 1 });
    const payments = await FeePayment.find({ ledger: l._id }).populate("statement").sort({ date: -1 });

    const totalFees = statements.reduce((sum, s) => sum + s.dueAmount, 0);
    const paidAmount = statements.reduce((sum, s) => sum + s.paidAmount, 0);
    const remainingAmount = statements.reduce((sum, s) => sum + s.pendingAmount, 0);
    const discount = l.discount || 0;
    const netFee = totalFees - discount;

    res.json({
      ...l.toObject(),
      totalFees,
      paidAmount,
      remainingAmount,
      discount,
      netFee,
      monthlyBills: statements,
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST create fee ledger (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { student, course, totalFees, discount, paidAmount, initialPaymentMode, notes, month, dueDate } = req.body;
    if (!student || !course || !totalFees) {
      return res.status(400).json({ message: "student, course, and totalFees are required" });
    }

    // Helper to extract clean string ID from string or populated object representation
    const getDocId = (val) => {
      if (!val) return null;
      if (typeof val === "string") return val.trim();
      if (typeof val === "object") {
        return val._id ? String(val._id).trim() : (val.id ? String(val.id).trim() : String(val).trim());
      }
      return String(val).trim();
    };

    const studentId = getDocId(student);
    const courseId = getDocId(course);

    // 1. Verify student exists
    const User = require("../models/User");
    const studentDoc = await User.findById(studentId);
    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Verify enrollment exists (with self-healing for batch-enrolled students)
    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      const Batch = require("../models/Batch");
      
      // Query batches associated with the course that are in student's assigned batches
      const studentBatches = await Batch.find({
        _id: { $in: studentDoc.assignedBatches || [] },
        course: courseId
      });

      let hasLegacyBatchWithCourse = false;
      if (studentDoc.batch) {
        const legacyBatchDoc = await Batch.findById(studentDoc.batch);
        if (legacyBatchDoc && String(legacyBatchDoc.course) === String(courseId)) {
          hasLegacyBatchWithCourse = true;
        }
      }

      const hasBatchWithCourse = studentBatches.length > 0 || hasLegacyBatchWithCourse;

      if (hasBatchWithCourse) {
        enrollment = new Enrollment({
          student: studentId,
          course: courseId,
          status: "Active"
        });
        await enrollment.save();
        console.log(`[Self-Healing] Automatically created Enrollment for student ${studentId} and course ${courseId} via batch assignment`);
      } else {
        return res.status(400).json({ message: "Student is not enrolled in the specified course" });
      }
    }

    // 3. Prevent duplicate ledger
    const existing = await FeeLedger.findOne({ student: studentId, course: courseId });
    if (existing) {
      return res.status(400).json({ message: "Fee ledger already exists for this student in this course" });
    }

    const stdMonthlyVal = Number(totalFees);
    const discountVal = Number(discount || 0);
    const initialPaidVal = Number(paidAmount || 0);
    const netMonthlyVal = Math.max(0, stdMonthlyVal - discountVal);

    if (initialPaidVal > netMonthlyVal) {
      return res.status(400).json({ message: "Initial paid amount cannot exceed net monthly fee" });
    }

    // 4. Create FeeLedger
    const ledger = new FeeLedger({
      student: studentId,
      course: courseId,
      monthlyFee: stdMonthlyVal,
      discount: discountVal,
      netMonthlyFee: netMonthlyVal,
      startDate: new Date(),
      billingCycle: "monthly",
      status: initialPaidVal >= netMonthlyVal ? "Paid" : (initialPaidVal > 0 ? "Partial" : "Due"),
      notes: notes || "",
    });
    await ledger.save();

    // 5. Seed first billing month statement
    const stmtMonth = month || new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
    const stmtDueDate = dueDate ? new Date(dueDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 10);

    const statement = new MonthlyFeeStatement({
      ledger: ledger._id,
      student: studentId,
      course: courseId,
      month: stmtMonth,
      dueAmount: netMonthlyVal,
      paidAmount: initialPaidVal,
      pendingAmount: netMonthlyVal - initialPaidVal,
      dueDate: stmtDueDate,
      status: initialPaidVal >= netMonthlyVal ? "Paid" : (initialPaidVal > 0 ? "Partial" : "Due"),
    });
    await statement.save();

    // 6. Record payment & receipt if initial paid > 0
    let initialPayment = null;
    if (initialPaidVal > 0) {
      const payment = new FeePayment({
        student: studentId,
        ledger: ledger._id,
        statement: statement._id,
        amount: initialPaidVal,
        mode: initialPaymentMode || "Cash",
        reference: "Initial Payment",
        remarks: `First month billing: ${stmtMonth}`,
      });
      await payment.save();
      initialPayment = payment;

      const yPrefix = new Date().getFullYear().toString().slice(-2);
      const rNumber = `REC${yPrefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const receipt = new Receipt({
        receiptNo: rNumber,
        payment: payment._id,
        student: studentId,
        course: courseId,
        month: stmtMonth,
        amountPaid: initialPaidVal,
        paymentMode: initialPaymentMode || "Cash",
        referenceNumber: "",
        remainingBalance: netMonthlyVal - initialPaidVal,
        date: new Date(),
      });
      await receipt.save();
    }

    await autoGenerateStatementsForLedger(ledger);

    const populatedLedger = await FeeLedger.findById(ledger._id)
      .populate("student", "name email phone registrationNumber className stream")
      .populate("course", "title");

    const statements = await MonthlyFeeStatement.find({ ledger: ledger._id });
    const paymentsList = initialPayment ? [initialPayment] : [];

    res.status(201).json({
      message: "Fee ledger created successfully",
      fee: {
        ...populatedLedger.toObject(),
        totalFees: stdMonthlyVal,
        paidAmount: initialPaidVal,
        remainingAmount: netMonthlyVal - initialPaidVal,
        discount: discountVal,
        netFee: netMonthlyVal,
        monthlyBills: statements,
        payments: paymentsList,
      },
    });
  } catch (err) {
    console.error("Error creating fee ledger:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST add a monthly statement (admin only)
router.post("/:id/monthly-bills", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { month, standardFee, discount, dueDate } = req.body;
    if (!month || !standardFee || !dueDate) {
      return res.status(400).json({ message: "month, standardFee, and dueDate are required" });
    }

    const ledger = await FeeLedger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ message: "Fee ledger not found" });

    // Check if already billed
    const exists = await MonthlyFeeStatement.findOne({ ledger: ledger._id, month });
    if (exists) {
      return res.status(400).json({ message: `Month ${month} has already been billed` });
    }

    const stdVal = Number(standardFee);
    const discVal = Number(discount || 0);
    const dueAmountVal = Math.max(0, stdVal - discVal);

    const statement = new MonthlyFeeStatement({
      ledger: ledger._id,
      student: ledger.student,
      course: ledger.course,
      month,
      dueAmount: dueAmountVal,
      paidAmount: 0,
      pendingAmount: dueAmountVal,
      dueDate: new Date(dueDate),
      status: "Due",
    });
    await statement.save();

    // Recalculate ledger status
    const allStatements = await MonthlyFeeStatement.find({ ledger: ledger._id });
    const allPaid = allStatements.every((s) => s.status === "Paid");
    const anyPaidOrPartial = allStatements.some((s) => s.paidAmount > 0);

    if (allPaid) {
      ledger.status = "Paid";
    } else if (anyPaidOrPartial) {
      ledger.status = "Partial";
    } else {
      ledger.status = "Due";
    }
    await ledger.save();

    const populatedLedger = await FeeLedger.findById(ledger._id)
      .populate("student", "name email phone registrationNumber className stream")
      .populate("course", "title");

    const payments = await FeePayment.find({ ledger: ledger._id }).populate("statement").sort({ date: -1 });

    const totalFees = allStatements.reduce((sum, s) => sum + s.dueAmount, 0);
    const paidAmount = allStatements.reduce((sum, s) => sum + s.paidAmount, 0);
    const remainingAmount = allStatements.reduce((sum, s) => sum + s.pendingAmount, 0);

    res.status(201).json({
      message: "Billing month added successfully",
      fee: {
        ...populatedLedger.toObject(),
        totalFees,
        paidAmount,
        remainingAmount,
        discount: ledger.discount,
        netFee: totalFees - ledger.discount,
        monthlyBills: allStatements,
        payments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST record fee payment (admin only)
router.post("/:id/payments", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { amount, mode, date, reference, remarks, month } = req.body;
    if (!amount || !mode || !month) {
      return res.status(400).json({ message: "amount, mode, and month are required" });
    }

    const ledger = await FeeLedger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ message: "Fee ledger not found" });

    const statement = await MonthlyFeeStatement.findOne({ ledger: ledger._id, month });
    if (!statement) {
      return res.status(404).json({ message: `Billing month statement for ${month} not found` });
    }

    const payAmount = Number(amount);
    if (payAmount > statement.pendingAmount) {
      return res.status(400).json({
        message: `Payment amount ₹${payAmount} exceeds pending due ₹${statement.pendingAmount} for ${month}`,
      });
    }

    // 1. Create Payment
    const payment = new FeePayment({
      student: ledger.student,
      ledger: ledger._id,
      statement: statement._id,
      amount: payAmount,
      mode,
      date: date ? new Date(date) : new Date(),
      reference: reference || "",
      remarks: remarks || `Payment applied for ${month}.`,
      collectedBy: "Admin",
    });
    await payment.save();

    // 2. Update statement paidAmount
    statement.paidAmount += payAmount;
    await statement.save();

    // 3. Update overall ledger status
    const allStatements = await MonthlyFeeStatement.find({ ledger: ledger._id });
    const allPaid = allStatements.every((s) => s.status === "Paid");
    const anyPaidOrPartial = allStatements.some((s) => s.paidAmount > 0);

    if (allPaid) {
      ledger.status = "Paid";
    } else if (anyPaidOrPartial) {
      ledger.status = "Partial";
    } else {
      ledger.status = "Due";
    }
    await ledger.save();

    // 4. Create Receipt
    const yPrefix = new Date(payment.date).getFullYear().toString().slice(-2);
    const rNumber = `REC${yPrefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const totalPendingAmount = allStatements.reduce((sum, s) => sum + s.pendingAmount, 0);

    const receipt = new Receipt({
      receiptNo: rNumber,
      payment: payment._id,
      student: ledger.student,
      course: ledger.course,
      month,
      amountPaid: payAmount,
      paymentMode: mode,
      referenceNumber: reference || "",
      remainingBalance: totalPendingAmount,
      date: payment.date,
    });
    await receipt.save();

    const populatedLedger = await FeeLedger.findById(ledger._id)
      .populate("student", "name email phone registrationNumber className stream")
      .populate("course", "title");

    const payments = await FeePayment.find({ ledger: ledger._id }).populate("statement").sort({ date: -1 });

    const totalFees = allStatements.reduce((sum, s) => sum + s.dueAmount, 0);
    const paidAmount = allStatements.reduce((sum, s) => sum + s.paidAmount, 0);
    const remainingAmount = allStatements.reduce((sum, s) => sum + s.pendingAmount, 0);

    res.status(201).json({
      message: "Payment recorded successfully",
      fee: {
        ...populatedLedger.toObject(),
        totalFees,
        paidAmount,
        remainingAmount,
        discount: ledger.discount,
        netFee: totalFees - ledger.discount,
        monthlyBills: allStatements,
        payments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT adjust ledger configurations (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { totalFees, discount, notes } = req.body;
    const ledger = await FeeLedger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ message: "Fee ledger not found" });

    if (totalFees !== undefined) ledger.monthlyFee = Number(totalFees);
    if (discount !== undefined) ledger.discount = Number(discount);
    if (notes !== undefined) ledger.notes = notes;

    ledger.netMonthlyFee = Math.max(0, ledger.monthlyFee - ledger.discount);
    await ledger.save();

    const populatedLedger = await FeeLedger.findById(ledger._id)
      .populate("student", "name email phone registrationNumber className stream")
      .populate("course", "title");

    const allStatements = await MonthlyFeeStatement.find({ ledger: ledger._id });
    const payments = await FeePayment.find({ ledger: ledger._id }).populate("statement").sort({ date: -1 });

    const sumFees = allStatements.reduce((sum, s) => sum + s.dueAmount, 0);
    const paidAmount = allStatements.reduce((sum, s) => sum + s.paidAmount, 0);
    const remainingAmount = allStatements.reduce((sum, s) => sum + s.pendingAmount, 0);

    res.json({
      message: "Fee ledger updated successfully",
      fee: {
        ...populatedLedger.toObject(),
        totalFees: sumFees,
        paidAmount,
        remainingAmount,
        discount: ledger.discount,
        netFee: sumFees - ledger.discount,
        monthlyBills: allStatements,
        payments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE fee ledger (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ledgerId = req.params.id;
    await FeeLedger.findByIdAndDelete(ledgerId);
    await MonthlyFeeStatement.deleteMany({ ledger: ledgerId });
    await FeePayment.deleteMany({ ledger: ledgerId });
    res.json({ message: "Fee ledger deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET specific receipt details
router.get("/receipts/:paymentId", authMiddleware, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ payment: req.params.paymentId })
      .populate("student", "name registrationNumber email className stream")
      .populate("course", "title");
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
