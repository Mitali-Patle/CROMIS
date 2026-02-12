import Resource from "../models/Resource.js";
import BookingRequest from "../models/BookingRequest.js";

/**
 * Admin creates a new resource
 */
export const createResource = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      capacity,
      description,
      tags = [],
      availableFrom,
      availableTo,
    } = req.body;

    if (!name || !type || !location) {
      return res
        .status(400)
        .json({ error: "name, type, and location are required" });
    }

    const resource = new Resource({
      name,
      type,
      location,
      capacity,
      description,
      tags,
      availableFrom,
      availableTo,
      isActive: true,
    });

    await resource.save();
    return res.status(201).json(resource);
  } catch (err) {
    console.error("createResource:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all active resources
 */
export const getAllResources = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.q) filter.name = { $regex: req.query.q, $options: "i" };

    const resources = await Resource.find(filter).sort({ name: 1 }).lean();
    return res.json(resources);
  } catch (err) {
    console.error("getAllResources:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get a resource by ID
 */
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).lean();
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    return res.json(resource);
  } catch (err) {
    console.error("getResourceById:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get resource with booking availability (NEW - Epic 2 Story 7)
 * Returns resource details + upcoming bookings for next 30 days
 */
export const getResourceWithAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id).lean();

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // For inactive resources, still show data but client can handle display
    // Get bookings for next 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    futureDate.setHours(23, 59, 59, 999);

    const bookings = await BookingRequest.find({
      resource: id,
      date: { $gte: today, $lte: futureDate },
      status: { $in: ["pending", "approved"] },
    })
      .populate("requester", "name email role")
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.json({
      resource,
      bookings,
    });
  } catch (err) {
    console.error("getResourceWithAvailability:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get resource booking history (NEW - Epic 2 Story 15)
 * Returns all bookings for a resource (past and future)
 */
export const getResourceBookingHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id).lean();

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Get filters from query params
    const filter = { resource: id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const bookings = await BookingRequest.find(filter)
      .populate("requester", "name email role")
      .populate("approvedBy", "name")
      .populate("rejectedBy", "name")
      .sort({ date: -1 })
      .lean();

    // Calculate statistics
    const stats = {
      total: bookings.length,
      approved: bookings.filter((b) => b.status === "approved").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };

    // Group by month for timeline view
    const timeline = bookings.reduce((acc, booking) => {
      const monthKey = new Date(booking.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          cancelled: 0,
        };
      }
      acc[monthKey].count++;
      acc[monthKey][booking.status]++;
      return acc;
    }, {});

    return res.json({
      resource,
      bookings,
      stats,
      timeline: Object.values(timeline).sort((a, b) =>
        b.month.localeCompare(a.month),
      ),
    });
  } catch (err) {
    console.error("getResourceBookingHistory:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update a resource (Admin)
 */
export const updateResource = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "type",
      "location",
      "capacity",
      "description",
      "tags",
      "availableFrom",
      "availableTo",
      "isActive",
    ];

    const update = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const updated = await Resource.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).lean();

    if (!updated) return res.status(404).json({ error: "Resource not found" });

    return res.json(updated);
  } catch (err) {
    console.error("updateResource:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Soft Delete (Deactivate) Resource
 */
export const deleteResource = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    ).lean();

    if (!updated) return res.status(404).json({ error: "Resource not found" });

    return res.json({ message: "Resource deactivated" });
  } catch (err) {
    console.error("deleteResource:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
