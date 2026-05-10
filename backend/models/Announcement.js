const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    isImportant: { type: Boolean, default: false },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
