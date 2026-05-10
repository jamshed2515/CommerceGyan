require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

// Serve uploaded PDFs as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));
app.use("/api/enquiry", require("./routes/enquiryRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/", (req, res) => res.send("Commerce Giyan API is running ✅"));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/katras_db";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection error:", err));
