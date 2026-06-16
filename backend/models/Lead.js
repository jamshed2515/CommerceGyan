const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    className: { type: String, default: "" },
    stream: { type: String, default: "" },
    interestedCourse: { type: String, default: "" },
    registrationDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Converted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
