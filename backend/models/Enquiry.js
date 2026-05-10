const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    email: { type: String, required: true },
    stream: { type: String, required: true },
    className: { type: String, required: true },
    address: { type: String, default: "" },
    message: { type: String, default: "" },
    status: { type: String, enum: ["new", "contacted", "enrolled"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
