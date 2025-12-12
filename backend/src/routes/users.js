import { Router } from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

// ADMIN ONLY USER MANAGEMENT
router.get("/", auth, roleAuth(["admin"]), getAllUsers);
router.get("/:id", auth, roleAuth(["admin"]), getUserById);
router.patch("/:id", auth, roleAuth(["admin"]), updateUser);
router.delete("/:id", auth, roleAuth(["admin"]), deleteUser);

export default router;
