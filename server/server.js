const express = require("express");
const cors = require("cors");
const path = require("path"); // 👈 ADD THIS
require("dotenv").config();

const connectDB = require("./config/db");

const complaintRoutes = require("./routes/complaintRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

connectDB();

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(cors());
app.use(express.json());

// 👈 ADD THIS — serves uploaded avatars as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", complaintRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Complaint Management API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});