import { Router } from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";

import {
<<<<<<< HEAD
  createUser,
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

// ADMIN ONLY USER MANAGEMENT
<<<<<<< HEAD
router.post("/", auth, roleAuth(["admin"]), createUser);
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
router.get("/", auth, roleAuth(["admin"]), getAllUsers);
router.get("/:id", auth, roleAuth(["admin"]), getUserById);
router.patch("/:id", auth, roleAuth(["admin"]), updateUser);
router.delete("/:id", auth, roleAuth(["admin"]), deleteUser);

export default router;
