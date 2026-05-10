const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    course: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
