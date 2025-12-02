import express from "express";
import { sampleTest } from "../controllers/sampleController.js";

const router = express.Router();

router.get("/test", sampleTest);

export default router;
