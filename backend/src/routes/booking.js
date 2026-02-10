import { Router } from "express";
import {
  createBookingRequest,
  getUserBookings,
  getAllBookings,
  updateBookingRequest,
  cancelBookingRequest,
} from "../controllers/bookingController.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = Router();

// Student / Faculty → Create booking
router.post("/", auth, createBookingRequest);

// Get logged-in user's bookings
router.get("/my", auth, getUserBookings);

// Admin → View all bookings
router.get("/", auth, roleAuth(["admin"]), getAllBookings);

// Edit booking (pending only, owner or admin)
router.patch("/:id", auth, updateBookingRequest);

// Cancel booking (owner or admin)
router.delete("/:id", auth, cancelBookingRequest);

export default router;
