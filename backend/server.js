import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
<<<<<<< HEAD
import app from "./src/app.js"; // ✅ app comes from here
=======
import app from "./src/app.js";   // ✅ app comes from here
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
import path from "path";
import express from "express";

const PORT = process.env.PORT || 5000;

// Serve uploaded files (Story 9)
app.use("/uploads", express.static(path.resolve("uploads")));

// Connect DB
<<<<<<< HEAD
connectDB().then(() => {
  // Story 12: Initial check and then every 24 hours
  import("./src/utils/cronJobs.js").then(({ autoExpireRequests }) => {
    autoExpireRequests().catch(err => console.error("Initial auto-expiry failed:", err));
    setInterval(autoExpireRequests, 24 * 60 * 60 * 1000);
  });
});
=======
connectDB();
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
