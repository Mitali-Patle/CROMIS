import { Router } from "express";
import Resource from "../models/Resource.js";
import BookingRequest from "../models/BookingRequest.js";
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = Router();

/* ------------------- PUBLIC ROUTES ------------------- */

// ✅ Availability route (MUST be before "/:id")
router.get("/availability/check", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // 🔑 Convert date string → start & end of day
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // Fetch all resources
    const resources = await Resource.find();

    // Fetch approved bookings for that day
    const bookings = await BookingRequest.find({
      date: { $gte: start, $lte: end },
      status: "approved",
    });

    const availability = resources.map((resource) => {
      const resourceBookings = bookings.filter(
        (b) => b.resource.toString() === resource._id.toString()
      );

      return {
        _id: resource._id,
        name: resource.name,
        isAvailable: resourceBookings.length === 0,
        bookings: resourceBookings.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
        })),
      };
    });

    res.json(availability);
  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Anyone can view resources
router.get("/", getAllResources);
router.get("/:id", getResourceById);

/* ------------------- ADMIN ROUTES ------------------- */
router.post("/", auth, roleAuth(["admin"]), createResource);
router.patch("/:id", auth, roleAuth(["admin"]), updateResource);
router.delete("/:id", auth, roleAuth(["admin"]), deleteResource);

export default router;




