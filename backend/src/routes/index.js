import { Router } from "express";
import authRoutes from "./auth.js";
import resourceRoutes from "./resource.js";
import bookingRoutes from "./bookings.js";
import analyticsRoutes from "./analytics.js";
import userRoutes from "./users.js";
import purposeTemplateRoutes from "./purposeTemplates.js";
import draftRoutes from "./drafts.js";
<<<<<<< HEAD
import auditRoutes from "./audit.js";
=======

>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running" });
});

router.use("/auth", authRoutes);
router.use("/resources", resourceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);
router.use("/purpose-templates", purposeTemplateRoutes);
router.use("/drafts", draftRoutes);
<<<<<<< HEAD
router.use("/audit", auditRoutes);

export default router;
=======


export default router;





>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
