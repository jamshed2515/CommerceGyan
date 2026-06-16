const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: { type: String, required: true },
    price: { type: Number, required: true },
    feeType: { type: String, enum: ["one_time", "monthly"], default: "one_time" },
    monthlyFee: { type: Number, default: 0 },
    courseFee: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    syllabus: [{ type: String }],
  },
  { timestamps: true }
);

courseSchema.pre("save", function () {
  this.price = this.feeType === "monthly" ? (this.monthlyFee || 0) : (this.courseFee || 0);
});

module.exports = mongoose.model("Course", courseSchema);
