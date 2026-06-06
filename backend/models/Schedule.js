const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { type: String, required: true }, // e.g. "16:00"
    endTime: { type: String, required: true },   // e.g. "18:00"
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
