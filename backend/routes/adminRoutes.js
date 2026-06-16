const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Batch = require("../models/Batch");
const Fee = require("../models/Fee");
const FeeLedger = require("../models/FeeLedger");
const MonthlyFeeStatement = require("../models/MonthlyFeeStatement");
const FeePayment = require("../models/FeePayment");
const Announcement = require("../models/Announcement");
const Enquiry = require("../models/Enquiry");
const Course = require("../models/Course");
const Achiever = require("../models/Achiever");
const Payment = require("../models/Payment");
const Lead = require("../models/Lead");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { autoGenerateStatementsForLedger } = require("../utils/feeHelpers");

const router = express.Router();

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ledgers = await FeeLedger.find();
    await Promise.all(ledgers.map(l => autoGenerateStatementsForLedger(l)));

    const [students, teachers, batches, announcements, enquiries, statements, courses, achievers, paymentsCount, leadsCount] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      Batch.countDocuments({ isActive: true }),
      Announcement.countDocuments(),
      Enquiry.countDocuments({ status: "new" }),
      MonthlyFeeStatement.find(),
      Course.countDocuments(),
      Achiever.countDocuments(),
      Payment.countDocuments(),
      Lead.countDocuments(),
    ]);
    const totalFeeCollected = statements.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
    const totalFeeDue = statements.reduce((sum, s) => sum + (s.pendingAmount || 0), 0);
    res.json({ students, teachers, batches, announcements, enquiries, totalFeeCollected, totalFeeDue, courses, achievers, paymentsCount, leadsCount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// CONSOLIDATED DASHBOARD ENDPOINT
// GET /api/admin/dashboard
// Returns ALL data in a single request.
// Replaces 11 individual fetches (students, teachers, batches,
// schedules, fees, courses, announcements, notes, enquiries,
// achievers, payments) + the /stats call.
// ─────────────────────────────────────────────
router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const Note = require("../models/Note");
    const Schedule = require("../models/Schedule");

    const [
      students, teachers, batches, schedules,
      ledgers, courses, announcements, notes,
      enquiries, achievers, payments, leads
    ] = await Promise.all([
      User.find({ role: "student" })
        .select("-password")
        .populate("batch", "batchName timing")
        .populate("assignedBatches", "batchName timing course")
        .sort({ createdAt: -1 })
        .lean(),

      User.find({ role: "teacher" })
        .select("-password")
        .sort({ createdAt: -1 })
        .lean(),

      Batch.find()
        .populate("course", "title price")
        .populate("teacher", "name email subject phone")
        .populate("students", "name email className stream")
        .sort({ createdAt: -1 })
        .lean(),

      Schedule.find()
        .populate({ path: "batch", select: "batchName timing course", populate: { path: "course", select: "title" } })
        .populate("teacher", "name subject email phone")
        .sort({ dayOfWeek: 1, startTime: 1 })
        .lean(),

      FeeLedger.find()
        .populate("student", "name email phone className stream registrationNumber")
        .populate("course", "title price")
        .sort({ createdAt: -1 })
        .lean(),

      Course.find().sort({ createdAt: -1 }).lean(),

      Announcement.find().sort({ createdAt: -1 }).lean(),

      Note.find().sort({ createdAt: -1 }).lean(),

      Enquiry.find().sort({ createdAt: -1 }).lean(),

      Achiever.find().sort({ createdAt: -1 }).lean(),

      Payment.find().sort({ createdAt: -1 }).lean(),

      Lead.find().sort({ createdAt: -1 }).lean(),
    ]);

    // Populate ledgers with statements and payments
    const populatedLedgers = await Promise.all(
      ledgers.map(async (l) => {
        await autoGenerateStatementsForLedger(l);
        const statements = await MonthlyFeeStatement.find({ ledger: l._id }).sort({ dueDate: 1 }).lean();
        const feePayments = await FeePayment.find({ ledger: l._id }).populate("statement").sort({ date: -1 }).lean();

        const totalFees = statements.reduce((sum, s) => sum + s.dueAmount, 0);
        const paidAmount = statements.reduce((sum, s) => sum + s.paidAmount, 0);
        const remainingAmount = statements.reduce((sum, s) => sum + s.pendingAmount, 0);
        const discount = l.discount || 0;
        const netFee = totalFees - discount;

        return {
          ...l,
          totalFees,
          paidAmount,
          remainingAmount,
          discount,
          netFee,
          monthlyBills: statements,
          payments: feePayments,
        };
      })
    );

    // Computed stats (no extra DB round-trips — derived from data already fetched)
    const totalFeeCollected = populatedLedgers.reduce((s, l) => s + (l.paidAmount || 0), 0);
    const totalFeeDue = populatedLedgers.reduce((s, l) => s + (l.remainingAmount || 0), 0);
    const stats = {
      students: students.length,
      teachers: teachers.length,
      batches: batches.filter((b) => b.isActive !== false).length,
      announcements: announcements.length,
      enquiries: enquiries.filter((e) => e.status === "new").length,
      totalFeeCollected,
      totalFeeDue,
      courses: courses.length,
      achievers: achievers.length,
      paymentsCount: payments.length,
      leads: leads.length,
      pendingLeads: leads.filter(l => l.status === "Pending").length,
      verifiedLeads: leads.filter(l => l.status === "Verified").length,
      convertedLeads: leads.filter(l => l.status === "Converted").length,
      rejectedLeads: leads.filter(l => l.status === "Rejected").length,
    };

    res.json({ stats, students, teachers, batches, schedules, fees: populatedLedgers, courses, announcements, notes, enquiries, achievers, payments, leads });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────
router.get("/students", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("batch", "batchName timing")
      .populate("assignedBatches", "batchName timing course")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/students/:id/fee", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { feeStatus } = req.body;
    const student = await User.findByIdAndUpdate(req.params.id, { feeStatus }, { new: true }).select("-password");
    res.json({ message: "Fee status updated", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/students/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// TEACHERS
// ─────────────────────────────────────────────
router.get("/teachers", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/teachers", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, phone, subject, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new User({
      name, email, password: hashedPassword,
      phone: phone || "", subject: subject || "",
      address: address || "", role: "teacher",
      isFirstLogin: true, // Teacher must set own password on first login
    });
    await teacher.save();
    const { password: _, ...teacherData } = teacher.toObject();
    res.status(201).json({ message: "Teacher created", teacher: teacherData });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/teachers/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, phone, subject, address } = req.body;
    const teacher = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, subject, address },
      { new: true }
    ).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json({ message: "Teacher updated", teacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/teachers/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// ADMIN: RESET TEACHER PASSWORD
// PUT /api/admin/teachers/:id/reset-password
// Assigns a new temporary password and sets isFirstLogin = true
// ─────────────────────────────────────────────
router.put("/teachers/:id/reset-password", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { tempPassword } = req.body;
    if (!tempPassword || tempPassword.trim().length < 6) {
      return res.status(400).json({ message: "Temporary password must be at least 6 characters" });
    }
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }
    teacher.password = await bcrypt.hash(tempPassword.trim(), 10);
    teacher.isFirstLogin = true;
    await teacher.save();
    res.json({ message: `Password reset successfully. Teacher must set a new password on next login.` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// GLOBAL SEARCH
// GET /api/admin/search?q=query
// Searches students, teachers, courses, batches, schedules
// ─────────────────────────────────────────────
router.get("/search", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 1) return res.json({ students: [], teachers: [], courses: [], batches: [], schedules: [] });

    const Schedule = require("../models/Schedule");
    const Course = require("../models/Course");
    const regex = new RegExp(q, "i");

    const [students, teachers, courses, batches, schedules] = await Promise.all([
      User.find({ role: "student", $or: [{ name: regex }, { email: regex }, { phone: regex }, { className: regex }, { stream: regex }] })
        .select("name email phone className stream batch")
        .populate("batch", "batchName timing")
        .limit(6),

      User.find({ role: "teacher", $or: [{ name: regex }, { email: regex }, { phone: regex }, { subject: regex }] })
        .select("name email phone subject")
        .limit(6),

      Course.find({ $or: [{ title: regex }, { description: regex }, { category: regex }] })
        .select("title category price duration")
        .limit(6),

      require("../models/Batch").find({ $or: [{ batchName: regex }, { timing: regex }, { description: regex }] })
        .select("batchName timing isActive")
        .populate("course", "title")
        .populate("teacher", "name")
        .limit(6),

      Schedule.find({ $or: [{ subject: regex }, { dayOfWeek: regex }, { note: regex }] })
        .select("subject dayOfWeek startTime endTime")
        .populate("batch", "batchName")
        .populate("teacher", "name")
        .limit(6),
    ]);

    res.json({ students, teachers, courses, batches, schedules });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────────
// LEADS & ADMISSIONS MANAGEMENT
// ─────────────────────────────────────────────

// Verify lead (updates status and lead details)
router.put("/leads/:id/verify", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, phone, className, stream, interestedCourse } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (className !== undefined) lead.className = className;
    if (stream !== undefined) lead.stream = stream;
    if (interestedCourse !== undefined) lead.interestedCourse = interestedCourse;
    lead.status = "Verified";

    await lead.save();
    res.json({ message: "Lead verified successfully", lead });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reject lead
router.put("/leads/:id/reject", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.status = "Rejected";
    await lead.save();
    res.json({ message: "Lead status updated to Rejected", lead });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Approve lead & convert to student
router.post("/leads/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.status === "Converted") {
      return res.status(400).json({ message: "Lead has already been converted to a student" });
    }

    // Verify student account doesn't already exist with this email
    const existingStudent = await User.findOne({ email: lead.email });
    if (existingStudent) {
      return res.status(400).json({ message: "A student with this email address already exists" });
    }

    // Generate unique sequential registration number CGA26xxxx
    const year = new Date().getFullYear() % 100;
    const prefix = `CGA${year}`;
    const lastStudent = await User.findOne({
      role: "student",
      registrationNumber: new RegExp(`^${prefix}`)
    }).sort({ registrationNumber: -1 });

    let nextNum = 1;
    if (lastStudent && lastStudent.registrationNumber) {
      const lastNumStr = lastStudent.registrationNumber.replace(prefix, "");
      const lastNum = parseInt(lastNumStr, 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const registrationNumber = `${prefix}${String(nextNum).padStart(4, "0")}`;

    // Create the student User
    const student = new User({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      password: lead.password, // hashed password copied directly from lead registration
      className: lead.className,
      stream: lead.stream,
      role: "student",
      registrationNumber,
      isFirstLogin: false,
    });

    await student.save();

    // Mark Lead as Converted
    lead.status = "Converted";
    await lead.save();

    res.status(201).json({
      message: `Lead approved successfully! Student created with Registration Number: ${registrationNumber}`,
      student,
      lead
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update student profile info (name, email, phone, parentName, parentPhone, address, stream, className)
router.put("/students/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, phone, parentName, parentPhone, address, stream, className } = req.body;
    const student = await User.findById(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (name) student.name = name;
    if (email) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (parentName !== undefined) student.parentName = parentName;
    if (parentPhone !== undefined) student.parentPhone = parentPhone;
    if (address !== undefined) student.address = address;
    if (stream !== undefined) student.stream = stream;
    if (className !== undefined) student.className = className;

    await student.save();
    res.json({ message: "Student profile updated successfully", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update student's internal notes
router.put("/students/:id/notes", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { internalNotes } = req.body;
    const student = await User.findById(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.internalNotes = internalNotes !== undefined ? internalNotes : "";
    await student.save();

    res.json({ message: "Student internal notes updated successfully", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update student's batch assignments (PUT /api/admin/students/:id/batches)
router.put("/students/:id/batches", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { batchIds } = req.body;
    if (!Array.isArray(batchIds)) {
      return res.status(400).json({ message: "batchIds must be an array of IDs" });
    }

    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const oldBatchIds = (student.assignedBatches || []).map((b) => b.toString());

    student.assignedBatches = batchIds;
    student.batch = batchIds.length > 0 ? batchIds[0] : null;
    await student.save();

    const addedBatches = batchIds.filter((bId) => !oldBatchIds.includes(bId));
    const removedBatches = oldBatchIds.filter((bId) => !batchIds.includes(bId));

    await Promise.all([
      ...addedBatches.map((bId) =>
        Batch.findByIdAndUpdate(bId, { $addToSet: { students: studentId } })
      ),
      ...removedBatches.map((bId) =>
        Batch.findByIdAndUpdate(bId, { $pull: { students: studentId } })
      ),
    ]);

    // Sync Enrollments for added batches
    const Enrollment = require("../models/Enrollment");
    for (const bId of addedBatches) {
      const batchDoc = await Batch.findById(bId);
      if (batchDoc && batchDoc.course) {
        const courseId = batchDoc.course._id || batchDoc.course;
        const exists = await Enrollment.findOne({ student: studentId, course: courseId });
        if (!exists) {
          await Enrollment.create({
            student: studentId,
            course: courseId,
            status: "Active"
          });
        } else if (exists.status !== "Active") {
          exists.status = "Active";
          await exists.save();
        }
      }
    }

    const updatedStudent = await User.findById(studentId)
      .select("-password")
      .populate("batch", "batchName timing")
      .populate("assignedBatches", "batchName timing course");

    res.json({
      message: "Student batch assignments updated successfully",
      student: updatedStudent,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET student's enrollments
router.get("/students/:id/enrollments", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const Enrollment = require("../models/Enrollment");
    const enrollments = await Enrollment.find({ student: req.params.id }).populate("course");
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
