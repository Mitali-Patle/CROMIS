import { Router } from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import { upload } from "../middleware/upload.js";

import {
  createBookingRequest,
  getUserBookings,
  getAllBookings,
  updateBookingRequest,
  cancelBookingRequest,
  getBookedSlots,
  getBookingById,
  addAdminComment,
} from "../controllers/bookingController.js";

const router = Router();

/* ===============================
   AVAILABILITY (FIRST)
   =============================== */
router.get("/booked-slots", auth, getBookedSlots);
router.get("/availability", auth, getBookedSlots);

/* ===============================
   USER BOOKINGS
   =============================== */
router.post(
  "/",
  auth,
  upload.array("attachments", 5),
  createBookingRequest
);
router.get("/my", auth, getUserBookings);

/* ===============================
   SINGLE BOOKING (DETAILS)
   =============================== */
router.get("/:id", auth, getBookingById);

/* ===============================
   ADMIN BOOKINGS
   =============================== */
router.get("/", auth, roleAuth(["admin"]), getAllBookings);

/* ===============================
   ADMIN COMMENTS (INTERNAL)
   =============================== */
router.post(
  "/:id/admin-comment",
  auth,
  roleAuth(["admin"]),
  addAdminComment
);


/* ===============================
   MUTATIONS
   =============================== */
router.patch("/:id", auth, updateBookingRequest);
router.delete("/:id", auth, cancelBookingRequest);

export default router;
