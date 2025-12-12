import { Router } from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

import {
  getDailyUtilization,
  getWeeklyUtilization,
  getPeakHours,
  getUnderutilizedResources,
  getUsageByRole,
  getResourceHeatmap,
} from "../controllers/analyticsController.js";

const router = Router();

// Admin-only analytics endpoints
router.get("/daily", auth, roleAuth(["admin"]), getDailyUtilization);
router.get("/weekly", auth, roleAuth(["admin"]), getWeeklyUtilization);
router.get("/peak-hours", auth, roleAuth(["admin"]), getPeakHours);
router.get(
  "/underutilized",
  auth,
  roleAuth(["admin"]),
  getUnderutilizedResources,
);
router.get("/role-usage", auth, roleAuth(["admin"]), getUsageByRole);
router.get(
  "/heatmap/:resourceId",
  auth,
  roleAuth(["admin"]),
  getResourceHeatmap,
);

export default router;
