const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: { type: String, required: true },
    price: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },
    syllabus: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
