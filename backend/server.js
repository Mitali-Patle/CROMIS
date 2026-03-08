import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/app.js"; // ✅ app comes from here
import path from "path";
import express from "express";

const PORT = process.env.PORT || 5000;

// Serve uploaded files (Story 9)
app.use("/uploads", express.static(path.resolve("uploads")));

// Connect DB
connectDB().then(() => {
  // Story 12: Initial check and then every 24 hours
  import("./src/utils/cronJobs.js").then(({ autoExpireRequests }) => {
    autoExpireRequests().catch(err => console.error("Initial auto-expiry failed:", err));
    setInterval(autoExpireRequests, 24 * 60 * 60 * 1000);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
