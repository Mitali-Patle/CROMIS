console.log("🔥 bookingController LOADED:", import.meta.url);
import BookingRequest from "../models/BookingRequest.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";

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
 * Get priority based on user role
 * Admin = 3, Faculty = 2, Student = 1
 */
const getPriority = (role) => {
  switch (role) {
    case 'admin': return 3;
    case 'faculty': return 2;
    case 'student': return 1;
    default: return 1;
  }
};

/**
 * Create a booking request (students + faculty)
 * UPDATED: Implements faculty priority system
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
      ? req.files.map((f) => f.path)
      : req.body.attachments || [];
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
    if (r.availableFrom && r.availableTo) {
      const availStart = toUTCDateTime(dateStr, r.availableFrom);
      const availEnd = toUTCDateTime(dateStr, r.availableTo);
      if (start < availStart || end > availEnd) {
        return res
          .status(400)
          .json({ error: "Time slot outside resource availability" });
      }
    }

    // Get requester details for priority
    const requesterUser = await User.findById(requesterId);
    if (!requesterUser) {
      return res.status(400).json({ error: "Invalid user" });
    }
    
    const requesterPriority = getPriority(requesterUser.role);

    // Conflict checking with priority override
    const potentialConflicts = await BookingRequest.find({
      resource,
      date: normalizedDate,
      status: { $in: ["pending", "approved"] },
    }).populate('requester');

    let hasConflict = false;
    const conflictsToCancel = [];

    for (const conflict of potentialConflicts) {
      const dateStrForConflict = conflict.date.toISOString().split("T")[0];
      const cStart = toUTCDateTime(dateStrForConflict, conflict.startTime);
      const cEnd = toUTCDateTime(dateStrForConflict, conflict.endTime);
      
      if (hasOverlap(cStart, cEnd, start, end)) {
        // Check priority
        const conflictPriority = getPriority(conflict.requester.role);
        
        if (requesterPriority > conflictPriority) {
          // Current requester has higher priority - mark for cancellation
          conflictsToCancel.push(conflict);
          console.log(`[PRIORITY] ${requesterUser.role} overriding ${conflict.requester.role} booking`);
        } else {
          // Lower or equal priority - genuine conflict
          hasConflict = true;
          break;
        }
      }
    }

    if (hasConflict) {
      return res.status(409).json({ 
        error: `Time slot already booked by ${requesterUser.role === 'faculty' ? 'another faculty member or admin' : 'higher or equal priority user'}` 
      });
    }

    // Cancel lower priority bookings
    for (const conflict of conflictsToCancel) {
      conflict.status = 'cancelled';
      conflict.adminComment = `Overridden by ${requesterUser.role} priority booking on ${new Date().toISOString()}`;
      await conflict.save();
      
      // Log the override
      console.log(`[PRIORITY OVERRIDE] Cancelled booking ${conflict._id} (${conflict.requester.role}) for ${requesterUser.role} priority`);
      
      // TODO: In production, send email notification to cancelled user
      // Example: await sendCancellationEmail(conflict.requester.email, conflict, 'priority override');
    }

    // Create the new booking
    const booking = new BookingRequest({
      requester: requesterId,
      resource,
      date: normalizedDate,
      startTime,
      endTime,
      purpose,
      attachments,
      status: 'pending',
      priority: requesterPriority, // Store priority for reference
    });

    await booking.save();
    await booking.populate(["resource", "requester"]);

    // Include override info in response
    const response = {
      ...booking.toObject(),
      overriddenBookings: conflictsToCancel.length
    };

    if (conflictsToCancel.length > 0) {
      response.message = `Booking created. ${conflictsToCancel.length} lower priority booking(s) were automatically cancelled.`;
    }

    return res.status(201).json(response);
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
      .populate(["resource", "requester", "approvedBy", "rejectedBy"])
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
      .populate(["resource", "requester", "approvedBy", "rejectedBy"])
      .sort({ date: -1 });
    return res.json(bookings);
  } catch (err) {
    console.error("getAllBookings:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Edit booking (only pending + owner OR admin)
 * UPDATED: Maintains priority logic on edits
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

    // Fetch resource for availability check if needed
    let r = await Resource.findById(booking.resource);
    if (!r || !r.isActive) {
      return res.status(400).json({ error: "Invalid or inactive resource" });
    }

    // Apply core updates
    if (newDateStr) booking.date = getNormalizedDate(newDateStr);
    if (newStartTime) booking.startTime = newStartTime;
    if (newEndTime) booking.endTime = newEndTime;
    if (purpose !== undefined) booking.purpose = purpose;
    if (newAttachments !== undefined) booking.attachments = newAttachments;

    // Admin-only updates
    if (isAdmin) {
      if (adminComment !== undefined) booking.adminComment = adminComment;
      if (rejectionReason !== undefined) booking.rejectionReason = rejectionReason;
    }
    // Admin-only: Status update (with validation)
    if (isAdmin && newStatus && booking.status !== newStatus) {
      const validStatuses = ["pending", "approved", "rejected", "cancelled", "expired"];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      if (newStatus === "approved" && booking.status !== "pending") {
        return res
          .status(400)
          .json({ error: "Can only approve pending bookings" });
      }
      if (newStatus === "rejected" && booking.status !== "pending") {
        return res
          .status(400)
          .json({ error: "Can only reject pending bookings" });
      }
      // For approved/rejected: Set fields
      if (newStatus === "approved") {
        booking.approvedBy = req.user.id;
        booking.approvedAt = new Date();
        
        // Check for conflicts before approving
        const dateStr = booking.date.toISOString().split("T")[0];
        const uStart = toUTCDateTime(dateStr, booking.startTime);
        const uEnd = toUTCDateTime(dateStr, booking.endTime);
        
        if (uStart >= uEnd) {
          return res.status(400).json({ error: "Invalid time range" });
        }
        
        if (r.availableFrom && r.availableTo) {
          const availStart = toUTCDateTime(dateStr, r.availableFrom);
          const availEnd = toUTCDateTime(dateStr, r.availableTo);
          if (uStart < availStart || uEnd > availEnd) {
            return res.status(400).json({ error: "Time slot outside resource availability" });
          }
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
      } else if (newStatus === "cancelled" || newStatus === "expired" || newStatus === "pending") {
        booking.approvedBy = null;
        booking.approvedAt = null;
        booking.rejectedBy = null;
        booking.rejectedAt = null;
      } // expired: no special handling
      booking.status = newStatus;
    }

    // Validation for date/time changes on pending bookings
    if ((newDateStr || newStartTime || newEndTime) && booking.status === "pending" && !isAdmin) {
      const dateStr = booking.date.toISOString().split("T")[0];
      const uStart = toUTCDateTime(dateStr, booking.startTime);
      const uEnd = toUTCDateTime(dateStr, booking.endTime);
      
      if (uStart >= uEnd) {
        return res.status(400).json({ error: "Invalid time range" });
      }
      
      if (r.availableFrom && r.availableTo) {
        const availStart = toUTCDateTime(dateStr, r.availableFrom);
        const availEnd = toUTCDateTime(dateStr, r.availableTo);
        if (uStart < availStart || uEnd > availEnd) {
          return res.status(400).json({ error: "Time slot outside resource availability" });
        }
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
    // For non-pending bookings, only allow owner edits if admin approves, but admins can always update
    if (booking.status !== "pending" && !isAdmin && !statusChanged) {
      return res
        .status(400)
        .json({ error: "Only pending bookings can be edited by non-admins" });
    }

    await booking.save();
    await booking.populate(["resource", "requester", "approvedBy", "rejectedBy"]);
    
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
    
    booking.approvedBy = null;
    booking.approvedAt = null;
    booking.rejectedBy = null;
    booking.rejectedAt = null;
    booking.status = "cancelled";
    
    await booking.save();
    await booking.populate(["resource", "requester", "approvedBy", "rejectedBy"]);
    
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
    const booking = await BookingRequest.findById(req.params.id).populate([
      "resource",
      "requester",
      "approvedBy",
      "rejectedBy",
    ]);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isOwner = String(booking.requester?._id) === String(req.user.id);
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

    const booking = await BookingRequest.findById(bookingId).populate(
      "comments.admin",
      "name email role",
    );

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
      return res.status(400).json({
        error: "Invalid status. Must be approved, rejected, or cancelled",
      });
    }

    // Find if the groupId exists at all
    const groupExists = await BookingRequest.exists({ groupId });
    if (!groupExists) {
      return res
        .status(404)
        .json({ error: `No bookings found with groupId: ${groupId}` });
    }

    // Find all bookings with this groupId that are pending
    const pendingInGroup = await BookingRequest.find({
      groupId,
      status: "pending",
    });

    if (pendingInGroup.length === 0) {
      return res.status(400).json({
        error: "No pending bookings found in this group",
        message: "All bookings in this group may have already been processed.",
      });
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
      { $set: updateData },
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
