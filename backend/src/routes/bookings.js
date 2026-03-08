import { Router } from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import { upload } from "../middleware/upload.js";

import {
<<<<<<< HEAD
  createBookingRequest,
  getUserBookings,
  getAllBookings,
  updateBookingRequest,
  cancelBookingRequest,
  getBookedSlots,
  getBookingById,
  addAdminComment,
  batchUpdateBookings,
  getOverlappingProposals,
} from "../controllers/bookingController.js";

import {
  createMultiDayBooking,
  createRecurringBooking,
=======
   createBookingRequest,
   getUserBookings,
   getAllBookings,
   updateBookingRequest,
   cancelBookingRequest,
   getBookedSlots,
   getBookingById,
   addAdminComment,
   batchUpdateBookings,
} from "../controllers/bookingController.js";

import {
   createMultiDayBooking,
   createRecurringBooking,
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
} from "../controllers/advancedBookingController.js";

const router = Router();

/* ===============================
   AVAILABILITY (FIRST)
   =============================== */
router.get("/booked-slots", auth, getBookedSlots);
router.get("/availability", auth, getBookedSlots);

/* ===============================
   USER BOOKINGS
   =============================== */
<<<<<<< HEAD
router.post("/", auth, upload.array("attachments", 5), createBookingRequest);
router.post(
  "/multi",
  auth,
  upload.array("attachments", 5),
  createMultiDayBooking,
);
router.post(
  "/recurring",
  auth,
  upload.array("attachments", 5),
  createRecurringBooking,
=======
router.post(
   "/",
   auth,
   upload.array("attachments", 5),
   createBookingRequest
);
router.post(
   "/multi",
   auth,
   upload.array("attachments", 5),
   createMultiDayBooking
);
router.post(
   "/recurring",
   auth,
   upload.array("attachments", 5),
   createRecurringBooking
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
);
router.get("/my", auth, getUserBookings);

/* ===============================
   SINGLE BOOKING (DETAILS)
   =============================== */
router.get("/:id", auth, getBookingById);
<<<<<<< HEAD
router.get("/:id/conflicts", auth, roleAuth(["admin"]), getOverlappingProposals);
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

/* ===============================
   ADMIN BOOKINGS
   =============================== */
router.get("/", auth, roleAuth(["admin"]), getAllBookings);

/* ===============================
   ADMIN COMMENTS (INTERNAL)
   =============================== */
<<<<<<< HEAD
router.post("/:id/admin-comment", auth, roleAuth(["admin"]), addAdminComment);
=======
router.post(
   "/:id/admin-comment",
   auth,
   roleAuth(["admin"]),
   addAdminComment
);
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

/* ===============================
   BATCH OPERATIONS
   =============================== */
<<<<<<< HEAD
router.patch("/batch", auth, roleAuth(["admin"]), batchUpdateBookings);
=======
router.patch(
   "/batch",
   auth,
   roleAuth(["admin"]),
   batchUpdateBookings
);

>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

/* ===============================
   MUTATIONS
   =============================== */
router.patch("/:id", auth, updateBookingRequest);
router.delete("/:id", auth, cancelBookingRequest);

export default router;
