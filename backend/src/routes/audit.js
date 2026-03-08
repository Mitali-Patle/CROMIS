import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { getAllUsers } from "../controllers/userController.js"; // Reuse admin check if needed

const router = express.Router();

// Middleware to ensure admin (already applied in index.js usually, but being explicit here if needed)
// Assuming auth middleware is applied in the main routes aggregator

router.get("/", getAuditLogs);

export default router;
