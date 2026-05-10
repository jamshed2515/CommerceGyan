const mongoose = require("mongoose");

const achieverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    score: { type: String, required: true }, // e.g., "91.2%"
    course: { type: String, default: "Commerce" },
    year: { type: String, default: new Date().getFullYear().toString() },
    imageUrl: { type: String, default: "" },
    rank: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achiever", achieverSchema);
