const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchName: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timing: { type: String, default: "" }, // e.g. "Mon-Fri, 4:00 PM – 6:00 PM"
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);
