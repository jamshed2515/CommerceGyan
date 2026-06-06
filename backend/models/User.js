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
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    profilePhoto: { type: String, default: "" },
    subject: { type: String, default: "" }, // for teachers: their teaching subject
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

