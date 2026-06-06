const express = require("express");
const Schedule = require("../models/Schedule");
const authMiddleware = require("../middleware/authMiddleware");
const teacherMiddleware = require("../middleware/teacherMiddleware");
const { findScheduleConflict } = require("../utils/scheduleHelpers");

const router = express.Router();

const populateOpts = [
  { path: "batch", select: "batchName timing course", populate: { path: "course", select: "title" } },
  { path: "teacher", select: "name subject email phone" },
];

// GET all schedules (auth required) — supports ?batch=&teacher= filters
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    const schedules = await Schedule.find(filter).populate(populateOpts).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET today's schedule
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    const filter = { dayOfWeek: today };
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    const schedules = await Schedule.find(filter).populate(populateOpts).sort({ startTime: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST create schedule (admin or teacher)
router.post("/", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const { batch, subject, teacher, dayOfWeek, startTime, endTime, note } = req.body;
    if (!batch || !subject || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ message: "batch, subject, dayOfWeek, startTime, endTime are required" });
    }
    if (teacher) {
      const conflict = await findScheduleConflict(Schedule, { teacher, dayOfWeek, startTime, endTime });
      if (conflict) return res.status(409).json({ message: conflict });
    }
    const schedule = new Schedule({ batch, subject, teacher: teacher || null, dayOfWeek, startTime, endTime, note });
    await schedule.save();
    const populated = await schedule.populate(populateOpts);
    res.status(201).json({ message: "Schedule created", schedule: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT update schedule (admin or teacher)
router.put("/:id", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const { batch, subject, teacher, dayOfWeek, startTime, endTime, note } = req.body;
    const existing = await Schedule.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Schedule not found" });

    const nextTeacher = teacher !== undefined ? teacher : existing.teacher;
    const nextDay = dayOfWeek || existing.dayOfWeek;
    const nextStart = startTime || existing.startTime;
    const nextEnd = endTime || existing.endTime;

    if (nextTeacher) {
      const conflict = await findScheduleConflict(Schedule, {
        teacher: nextTeacher,
        dayOfWeek: nextDay,
        startTime: nextStart,
        endTime: nextEnd,
        excludeId: req.params.id,
      });
      if (conflict) return res.status(409).json({ message: conflict });
    }

    const update = { subject, dayOfWeek, startTime, endTime, note };
    if (batch) update.batch = batch;
    if (teacher !== undefined) update.teacher = teacher || null;

    const schedule = await Schedule.findByIdAndUpdate(req.params.id, update, { new: true }).populate(populateOpts);
    res.json({ message: "Schedule updated", schedule });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE schedule (admin or teacher)
router.delete("/:id", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
