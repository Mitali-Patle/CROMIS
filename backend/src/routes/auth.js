// backend/src/routes/authRoutes.js
import express from "express";
import { signup, login } from "../controllers/authController.js";
import { getMe, updateMe } from "../controllers/profileController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", auth, getMe);
router.patch("/me", auth, updateMe);

export default router;
