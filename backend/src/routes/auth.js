// backend/src/routes/authRoutes.js
import express from "express";
import { signup, login } from "../controllers/authController.js";
<<<<<<< HEAD
import { getMe, updateMe } from "../controllers/profileController.js";
import auth from "../middleware/auth.js";
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
<<<<<<< HEAD
router.get("/me", auth, getMe);
router.patch("/me", auth, updateMe);
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

export default router;
