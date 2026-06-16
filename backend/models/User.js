const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    stream: { type: String, default: "" },
    className: { type: String, default: "" },
    address: { type: String, default: "" },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    feeStatus: { type: String, enum: ["paid", "due", "partial"], default: "due" },
    enrolledCourses: [{ type: String }],
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null }, // legacy single batch
    assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }], // support for multiple batches
    profilePhoto: { type: String, default: "" },
    subject: { type: String, default: "" }, // for teachers: their teaching subject
    isFirstLogin: { type: Boolean, default: false }, // true = must set password before dashboard access
    registrationNumber: { type: String, unique: true, sparse: true }, // CGA260001
    parentName: { type: String, default: "" },
    parentPhone: { type: String, default: "" },
    attendancePercentage: { type: Number, default: 100 },
    attendanceHistory: [
      {
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ["Present", "Absent", "Late"], default: "Present" }
      }
    ],
    internalNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


