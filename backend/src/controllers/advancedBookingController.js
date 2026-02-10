import BookingRequest from "../models/BookingRequest.js";
import Resource from "../models/Resource.js";
import crypto from "crypto";

/* Utility */
const toUTC = (dateStr, timeStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, min));
};

const daysBetween = (start, end) =>
  Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

/* ----------------------------------
   STORY 10 — Multi-Day Proposal
-----------------------------------*/
export const createMultiDayBooking = async (req, res) => {
  try {
    const { resource, startDate, endDate, startTime, endTime, purpose } =
      req.body;

    // Handle file uploads (Multer adds req.files)
    const attachments = req.files
      ? req.files.map(f => f.path)
      : (req.body.attachments || []);

    const requester = req.user.id;
    const groupId = crypto.randomUUID();

    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalDays = daysBetween(start, end);
    if (totalDays > 7) {
      return res.status(400).json({ error: "Max 7 days allowed" });
    }

    const resourceDoc = await Resource.findById(resource);
    if (!resourceDoc || !resourceDoc.isActive) {
      return res.status(400).json({ error: "Invalid resource" });
    }

    const bookings = [];

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const dateStr = date.toISOString().split("T")[0];
      const uStart = toUTC(dateStr, startTime);
      const uEnd = toUTC(dateStr, endTime);

      if (uStart >= uEnd) {
        return res.status(400).json({ error: "Invalid time range" });
      }

      const conflict = await BookingRequest.findOne({
        resource,
        date,
        status: { $in: ["pending", "approved"] },
      });

      if (conflict) {
        return res.status(409).json({
          error: `Conflict on ${dateStr}`,
        });
      }

      bookings.push({
        requester,
        resource,
        date,
        startTime,
        endTime,
        purpose,
        attachments,
        status: "pending",
        groupId,
      });
    }

    const created = await BookingRequest.insertMany(bookings);
    return res.status(201).json({ groupId, bookings: created });
  } catch (err) {
    console.error("multi-day:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ----------------------------------
   STORY 11 — Recurring Booking
-----------------------------------*/
export const createRecurringBooking = async (req, res) => {
  try {
    const { resource, startDate, endDate, startTime, endTime, purpose, recurrencePattern } =
      req.body;

    // Handle file uploads (Multer adds req.files)
    const attachments = req.files
      ? req.files.map(f => f.path)
      : (req.body.attachments || []);

    const requester = req.user.id;
    const groupId = crypto.randomUUID();

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (start > end) {
      return res.status(400).json({ error: "Start date must be before end date" });
    }

    const bookings = [];
    let currentDate = new Date(start);

    // Determine increment based on pattern
    const increment = recurrencePattern === "weekly" ? 7 : 1;

    // Safety limit: max 100 bookings
    let count = 0;
    const MAX_BOOKINGS = 100;

    while (currentDate <= end && count < MAX_BOOKINGS) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const uStart = toUTC(dateStr, startTime);
      const uEnd = toUTC(dateStr, endTime);

      const conflict = await BookingRequest.findOne({
        resource,
        date: new Date(currentDate),
        status: { $in: ["pending", "approved"] },
      });

      if (conflict) {
        return res.status(409).json({
          error: `Conflict on ${dateStr}`,
        });
      }

      bookings.push({
        requester,
        resource,
        date: new Date(currentDate),
        startTime,
        endTime,
        purpose,
        attachments,
        status: "pending",
        groupId,
      });

      currentDate.setDate(currentDate.getDate() + increment);
      count++;
    }

    if (bookings.length === 0) {
      return res.status(400).json({ error: "No valid dates in range" });
    }

    const created = await BookingRequest.insertMany(bookings);
    return res.status(201).json({ groupId, bookings: created });
  } catch (err) {
    console.error("recurring:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
