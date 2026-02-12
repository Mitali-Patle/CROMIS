import { Router } from "express";
import {
  createResource,
  getAllResources,
  getResourceById,
  getResourceWithAvailability, // NEW - Epic 2 Story 7
  getResourceBookingHistory, // NEW - Epic 2 Story 15
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/roleAuth.js";

const router = Router();
/**
 * Public/User Routes (Protected)
 */
// Get all resources (filtered)
router.get("/", protect, getAllResources);

// Get resource by ID (basic info)
router.get("/:id", protect, getResourceById);

// NEW: Get resource with availability calendar (Epic 2 Story 7)
router.get("/:id/details", protect, getResourceWithAvailability);

/**
 * Admin-Only Routes
 */
// Create resource
router.post("/", protect, adminOnly, createResource);

// Update resource
router.patch("/:id", protect, adminOnly, updateResource);

// Delete/Archive resource
router.delete("/:id", protect, adminOnly, deleteResource);

// NEW: Get resource booking history (Epic 2 Story 15)
router.get("/:id/history", protect, adminOnly, getResourceBookingHistory);

export default router;
