import { Router } from "express";
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

const router = Router();

/* ------------------- PUBLIC ROUTES ------------------- */
// Anyone can view resources
router.get("/", getAllResources);
router.get("/:id", getResourceById);

/* ------------------- ADMIN ROUTES ------------------- */
// Only Admin can create/update/delete resources
router.post("/", auth, roleAuth(["admin"]), createResource);
router.patch("/:id", auth, roleAuth(["admin"]), updateResource);
router.delete("/:id", auth, roleAuth(["admin"]), deleteResource);

export default router;
