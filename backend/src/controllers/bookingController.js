console.log("🔥 bookingController LOADED:", import.meta.url);
import BookingRequest from "../models/BookingRequest.js";
import Resource from "../models/Resource.js";

/**
 * Parse date string (YYYY-MM-DD) to UTC midnight Date
 */
const getNormalizedDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

/**
 * Parse date + time to full UTC DateTime
 */
const toUTCDateTime = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
};

/**
 * Check for overlaps between two time ranges on the same date/resource
 */
const hasOverlap = (existingStart, existingEnd, newStart, newEnd) => {
  return existingStart < newEnd && existingEnd > newStart;
};

/**
 * Create a booking request (students + faculty)
 */
export const createBookingRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const {
      resource,
      date: dateStr,
      startTime,
      endTime,
      purpose,
    } = req.body;

    // Handle file uploads (Multer adds req.files)
    const attachments = req.files
      ? req.files.map(f => f.path)
      : (req.body.attachments || []);

    if (!resource || !dateStr || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        error: "resource, date, startTime, endTime, purpose are required",
      });
    }
    const r = await Resource.findById(resource);
    if (!r || !r.isActive) {
      return res.status(400).json({ error: "Invalid or inactive resource" });
    }
    const normalizedDate = getNormalizedDate(dateStr);
    const start = toUTCDateTime(dateStr, startTime);
    const end = toUTCDateTime(dateStr, endTime);
    if (start >= end) {
      return res.status(400).json({ error: "Invalid time range" });
    }
    // Check against resource availability
    const availStart = toUTCDateTime(dateStr, r.availableFrom);
    const availEnd = toUTCDateTime(dateStr, r.availableTo);
    if (start < availStart || end > availEnd) {
      return res
        .status(400)
        .json({ error: "Time slot outside resource availability" });
    }
    // Conflict checking: Fetch potentials and check overlaps in JS
    const potentialConflicts = await BookingRequest.find({
      resource,
      date: normalizedDate,
      status: { $in: ["pending", "approved"] },
    });
    let hasConflict = false;
    for (const conflict of potentialConflicts) {
      const dateStrForConflict = conflict.date.toISOString().split("T")[0]; // YYYY-MM-DD from stored date
      const cStart = toUTCDateTime(dateStrForConflict, conflict.startTime);
      const cEnd = toUTCDateTime(dateStrForConflict, conflict.endTime);
      if (hasOverlap(cStart, cEnd, start, end)) {
        hasConflict = true;
        break;
      }
    }
    if (hasConflict) {
      return res.status(409).json({ error: "Time slot already booked" });
    }
    const booking = new BookingRequest({
      requester: requesterId,
      resource,
      date: normalizedDate,
      startTime,
      endTime,
      purpose,
      attachments,
      status: "pending",
    });
    await booking.save();
    await booking.populate(["resource", "requester"]); // Consistent population
    return res.status(201).json(booking);
  } catch (err) {
    console.error("createBookingRequest:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all bookings for logged-in user
 */
export const getUserBookings = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const bookings = await BookingRequest.find({ requester: requesterId })
      .populate(["resource", "requester", "approvedBy", "rejectedBy"]) // Include approval refs for visibility
      .sort({ date: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error("getUserBookings:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Admin: Get all bookings (with optional filters)
 */
export const getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.resource) filter.resource = req.query.resource;
    if (req.query.requester) filter.requester = req.query.requester;
    const bookings = await BookingRequest.find(filter)
      .populate(["resource", "requester", "approvedBy", "rejectedBy"]) // Include approval refs for visibility
      .sort({ date: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error("getAllBookings:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Edit booking (only pending + owner OR admin)
 */
export const updateBookingRequest = async (req, res) => {
  try {
    const bookingId = req.params.id;
    let booking = await BookingRequest.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const isOwner = String(booking.requester) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }
    const {
      date: newDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      purpose,
      attachments: newAttachments,
      adminComment,
      rejectionReason,
      status: newStatus,
    } = req.body;
    let dateChanged = false;
    let timeChanged = false;
    let statusChanged = false;
    let resourceAvailabilityChecked = false;
    // Fetch resource for availability check if needed
    let r = await Resource.findById(booking.resource);
    if (!r || !r.isActive) {
      return res.status(400).json({ error: "Invalid or inactive resource" });
    }
    // Apply core updates
    if (newDateStr) {
      booking.date = getNormalizedDate(newDateStr);
      dateChanged = true;
    }
    if (newStartTime) {
      booking.startTime = newStartTime;
      timeChanged = true;
    }
    if (newEndTime) {
      booking.endTime = newEndTime;
      timeChanged = true;
    }
    if (purpose !== undefined) booking.purpose = purpose;
    if (newAttachments !== undefined) booking.attachments = newAttachments;
    // Admin-only: Update adminComment or rejectionReason (any status)
    if (isAdmin) {
      if (adminComment !== undefined) booking.adminComment = adminComment;
      if (rejectionReason !== undefined)
        booking.rejectionReason = rejectionReason;
    }
    // Admin-only: Status update (with validation – flexible for any change)
    if (isAdmin && newStatus && booking.status !== newStatus) {
      const validStatuses = [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "expired",
      ];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      // For approved: Always check conflict/availability, regardless of current status
      if (newStatus === "approved") {
        booking.approvedBy = req.user.id;
        booking.approvedAt = new Date();
        // Conflict/availability check before approving
        const dateStr = booking.date.toISOString().split("T")[0];
        const uStart = toUTCDateTime(dateStr, booking.startTime);
        const uEnd = toUTCDateTime(dateStr, booking.endTime);
        if (uStart >= uEnd) {
          return res.status(400).json({ error: "Invalid time range" });
        }
        const availStart = toUTCDateTime(dateStr, r.availableFrom);
        const availEnd = toUTCDateTime(dateStr, r.availableTo);
        if (uStart < availStart || uEnd > availEnd) {
          return res
            .status(400)
            .json({ error: "Time slot outside resource availability" });
        }
        const potentialConflicts = await BookingRequest.find({
          resource: booking.resource,
          date: booking.date,
          status: { $in: ["pending", "approved"] },
          _id: { $ne: booking._id },
        });
        let hasConflict = false;
        for (const conflict of potentialConflicts) {
          const cDateStr = conflict.date.toISOString().split("T")[0];
          const cStart = toUTCDateTime(cDateStr, conflict.startTime);
          const cEnd = toUTCDateTime(cDateStr, conflict.endTime);
          if (hasOverlap(cStart, cEnd, uStart, uEnd)) {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) {
          return res.status(409).json({ error: "Time slot already booked" });
        }
      } else if (newStatus === "rejected") {
        booking.rejectedBy = req.user.id;
        booking.rejectedAt = new Date();
      } else if (newStatus === "cancelled") {
        // Clear approval fields
        booking.approvedBy = null;
        booking.approvedAt = null;
        booking.rejectedBy = null;
        booking.rejectedAt = null;
      } else if (newStatus === "expired") {
        // Optional: Clear fields or set expiry date
        booking.approvedBy = null;
        booking.approvedAt = null;
        booking.rejectedBy = null;
        booking.rejectedAt = null;
      } // pending: Reset fields if reverting
      else if (newStatus === "pending") {
        booking.approvedBy = null;
        booking.approvedAt = null;
        booking.rejectedBy = null;
        booking.rejectedAt = null;
      }
      booking.status = newStatus;
      statusChanged = true;
    }
    // Core validation/checks only for date/time changes on pending bookings (non-admins or pre-status change)
    const needsValidation =
      dateChanged ||
      timeChanged ||
      newDateStr !== undefined ||
      newStartTime !== undefined ||
      newEndTime !== undefined;
    if (needsValidation && booking.status === "pending" && !statusChanged) {
      // Skip if status is being changed to approved (already checked)
      const dateStr = booking.date.toISOString().split("T")[0]; // Current (updated) date as YYYY-MM-DD
      const uStart = toUTCDateTime(dateStr, booking.startTime);
      const uEnd = toUTCDateTime(dateStr, booking.endTime);
      if (uStart >= uEnd) {
        return res.status(400).json({ error: "Invalid time range" });
      }
      // Check against resource availability (after updates)
      const availStart = toUTCDateTime(dateStr, r.availableFrom);
      const availEnd = toUTCDateTime(dateStr, r.availableTo);
      if (uStart < availStart || uEnd > availEnd) {
        return res
          .status(400)
          .json({ error: "Time slot outside resource availability" });
      }
      resourceAvailabilityChecked = true;
      const potentialConflicts = await BookingRequest.find({
        resource: booking.resource,
        date: booking.date,
        status: { $in: ["pending", "approved"] },
        _id: { $ne: booking._id },
      });
      let hasConflict = false;
      for (const conflict of potentialConflicts) {
        const cDateStr = conflict.date.toISOString().split("T")[0];
        const cStart = toUTCDateTime(cDateStr, conflict.startTime);
        const cEnd = toUTCDateTime(cDateStr, conflict.endTime);
        if (hasOverlap(cStart, cEnd, uStart, uEnd)) {
          hasConflict = true;
          break;
        }
      }
      if (hasConflict) {
        return res.status(409).json({ error: "Time slot already booked" });
      }
    }
    // If only purpose/attachments changed (no date/time), still check availability for safety if time fields were updated
    if (
      !resourceAvailabilityChecked &&
      (newStartTime || newEndTime) &&
      booking.status === "pending" &&
      !statusChanged
    ) {
      const dateStr = booking.date.toISOString().split("T")[0];
      const uStart = toUTCDateTime(dateStr, booking.startTime);
      const uEnd = toUTCDateTime(dateStr, booking.endTime);
      const availStart = toUTCDateTime(dateStr, r.availableFrom);
      const availEnd = toUTCDateTime(dateStr, r.availableTo);
      if (uStart < availStart || uEnd > availEnd) {
        return res
          .status(400)
          .json({ error: "Time slot outside resource availability" });
      }
    }
    // Removed restriction for non-pending edits – admins can always update, owners only if pending or no status change
    if (booking.status !== "pending" && !isAdmin && !statusChanged) {
      return res
        .status(400)
        .json({ error: "Only pending bookings can be edited by non-admins" });
    }
    await booking.save();
    await booking.populate([
      "resource",
      "requester",
      "approvedBy",
      "rejectedBy",
    ]); // Populate for consistency, including approval refs
    return res.json(booking);
  } catch (err) {
    console.error("updateBookingRequest:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Cancel booking (owner or admin)
 */
export const cancelBookingRequest = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await BookingRequest.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const isOwner = String(booking.requester) === String(req.user.id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    // Clear approval fields on cancel
    booking.approvedBy = null;
    booking.approvedAt = null;
    booking.rejectedBy = null;
    booking.rejectedAt = null;
    booking.status = "cancelled";
    await booking.save();
    await booking.populate([
      "resource",
      "requester",
      "approvedBy",
      "rejectedBy",
    ]); // Optional: for consistency
    return res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelBookingRequest:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get booked slots for a resource on a given date
 * Used by students & faculty to check availability
 *
 * Query params:
 *  - resource (required)
 *  - date (YYYY-MM-DD, required)
 */
export const getBookedSlots = async (req, res) => {
  try {
    const { resource, date } = req.query;

    if (!resource || !date) {
      return res.status(400).json({
        error: "resource and date are required",
      });
    }

    // Normalize date to UTC midnight
    const [year, month, day] = date.split("-").map(Number);
    const normalizedDate = new Date(Date.UTC(year, month - 1, day));

    // Fetch all pending + approved bookings
    const bookings = await BookingRequest.find({
      resource,
      date: normalizedDate,
      status: { $in: ["pending", "approved"] },
    }).select("startTime endTime status");

    // Return only booked ranges
    const bookedSlots = bookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
    }));

    return res.json({
      date,
      resource,
      bookedSlots,
    });
  } catch (err) {
    console.error("getBookedSlots:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get single booking by ID
 * Owner (student/faculty) OR admin only
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.id)
      .populate(["resource", "requester", "approvedBy", "rejectedBy"]);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isOwner =
      String(booking.requester?._id) === String(req.user.id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.json(booking);
  } catch (err) {
    console.error("getBookingById:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// ADMIN: Add internal comment
// ===============================
export const addAdminComment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    if (text.length > 1000) {
      return res.status(400).json({ message: "Max 1000 characters allowed" });
    }

    const booking = await BookingRequest.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.comments.push({
      text,
      admin: req.user.id,
    });

    await booking.save();

    res.status(201).json({
      message: "Admin comment added",
      comments: booking.comments,
    });
  } catch (err) {
    console.error("Add admin comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// ADMIN: Get internal comments
// ===============================
export const getAdminComments = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await BookingRequest.findById(bookingId)
      .populate("comments.admin", "name email role");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking.comments);
  } catch (err) {
    console.error("Get admin comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// ADMIN: Batch Update Bookings by Group ID
// ===============================
export const batchUpdateBookings = async (req, res) => {
  try {
    const { groupId, status } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: "groupId is required" });
    }

    const validStatuses = ["approved", "rejected", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be approved, rejected, or cancelled" });
    }

    // Find all bookings with this groupId
    const bookings = await BookingRequest.find({ groupId, status: "pending" });

    if (bookings.length === 0) {
      return res.status(404).json({ error: "No pending bookings found with this groupId" });
    }

    // Update all bookings in the group
    const updateData = { status };

    if (status === "approved") {
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    } else if (status === "rejected") {
      updateData.rejectedBy = req.user.id;
      updateData.rejectedAt = new Date();
    } else if (status === "cancelled") {
      updateData.approvedBy = null;
      updateData.approvedAt = null;
      updateData.rejectedBy = null;
      updateData.rejectedAt = null;
    }

    const result = await BookingRequest.updateMany(
      { groupId, status: "pending" },
      { $set: updateData }
    );

    return res.json({
      message: `Successfully updated ${result.modifiedCount} bookings`,
      modifiedCount: result.modifiedCount,
      groupId,
      status,
    });
  } catch (err) {
    console.error("batchUpdateBookings:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

