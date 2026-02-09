import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/app.js";   // ✅ app comes from here
import path from "path";
import express from "express";

const PORT = process.env.PORT || 5000;

// Serve uploaded files (Story 9)
app.use("/uploads", express.static(path.resolve("uploads")));

// Connect DB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
