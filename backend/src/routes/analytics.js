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
<<<<<<< HEAD
  getResourceOccupancyTimeline,
  getTopResources,
  getOverallStatus,
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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
<<<<<<< HEAD
router.get("/heatmap", auth, roleAuth(["admin"]), getResourceHeatmap);
router.get(
  "/timeline",
  auth,
  roleAuth(["admin"]),
  getResourceOccupancyTimeline,
);
router.get("/top-resources", auth, roleAuth(["admin"]), getTopResources);
router.get("/overall-status", auth, roleAuth(["admin"]), getOverallStatus);
=======
router.get(
  "/heatmap/:resourceId",
  auth,
  roleAuth(["admin"]),
  getResourceHeatmap,
);
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

export default router;
