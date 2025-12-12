import { Router } from "express";
import authRoutes from "./auth.js";
import resourceRoutes from "./resource.js";
import bookingRoutes from "./booking.js";
import analyticsRoutes from "./analytics.js";
import userRoutes from "./users.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running" });
});

router.use("/auth", authRoutes);
router.use("/resources", resourceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);

export default router;
