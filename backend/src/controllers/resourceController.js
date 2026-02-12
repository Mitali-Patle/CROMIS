import Resource from "../models/Resource.js";

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
      isActive: true, // matches schema
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
    const filter = { isActive: true }; // matches schema

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
      { isActive: false }, // schema-consistent
      { new: true },
    ).lean();

    if (!updated) return res.status(404).json({ error: "Resource not found" });

    return res.json({ message: "Resource deactivated" });
  } catch (err) {
    console.error("deleteResource:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
