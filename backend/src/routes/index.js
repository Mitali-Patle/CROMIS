import { Router } from "express";
import authRoutes from "./auth.js";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running" });
});

// Mount authentication routes
router.use("/auth", authRoutes);

// You can add future route groups like:
// router.use("/reservations", reservationRoutes);
// router.use("/resources", resourceRoutes);

export default router;
