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
      building,
      room,
      capacity,
      description,
      tags = [],
      availableFrom,
      availableTo,
      instructions,
      maintenanceReason,
      maintenanceEndDate,
      ownerNotes,
    } = req.body;

    // Auto-compute location from building+room if provided
    const computedLocation =
      building && room ? `${building}, ${room}` : location;

    if (!name || !type || !computedLocation) {
      return res
        .status(400)
        .json({ error: "name, type, and location are required" });
    }

    const resourceData = {
      name,
      type,
      location: computedLocation,
      building,
      room,
      capacity,
      description,
      tags,
      availableFrom,
      availableTo,
      instructions,
      maintenanceReason,
      maintenanceEndDate,
      ownerNotes,
      isActive: true,
    };

    if (req.files?.image?.[0]) {
      resourceData.imageUrl = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files?.documents?.length) {
      resourceData.documents = req.files.documents.map(
        (f) => `/uploads/${f.filename}`,
      );
    }

    const resource = new Resource(resourceData);

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

    // Text search across name, type, location
    if (req.query.q) {
      const regex = { $regex: req.query.q, $options: "i" };
      filter.$or = [{ name: regex }, { type: regex }, { location: regex }];
    }
    if (req.query.type) filter.type = req.query.type;
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(",").map((t) => t.trim()) };
    }
    if (req.query.minCapacity || req.query.maxCapacity) {
      filter.capacity = {};
      if (req.query.minCapacity)
        filter.capacity.$gte = Number(req.query.minCapacity);
      if (req.query.maxCapacity)
        filter.capacity.$lte = Number(req.query.maxCapacity);
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Resource.countDocuments(filter),
    ]);

    return res.json({ resources, total, page, limit });
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
 * Update a resource (Admin)
 */
export const updateResource = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "type",
      "location",
      "building",
      "room",
      "capacity",
      "description",
      "tags",
      "availableFrom",
      "availableTo",
      "isActive",
      "imageUrl",
      "instructions",
      "maintenanceReason",
      "maintenanceEndDate",
      "ownerNotes",
    ];

    const update = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    // Auto-compute location if building+room are set
    if (update.building && update.room) {
      update.location = `${update.building}, ${update.room}`;
    }

    if (req.files?.image?.[0]) {
      update.imageUrl = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files?.documents?.length) {
      // Append new documents to existing ones
      const existing = (await Resource.findById(req.params.id).lean())?.documents || [];
      update.documents = [
        ...existing,
        ...req.files.documents.map((f) => `/uploads/${f.filename}`),
      ];
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

/**
 * Story 15: Get booking history for a specific resource
 */
export const getResourceHistory = async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ resource: req.params.id })
      .populate("requester", "name email")
      .sort({ date: -1 })
      .lean();
    return res.json(bookings);
  } catch (err) {
    console.error("getResourceHistory:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
