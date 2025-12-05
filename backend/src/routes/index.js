import express from "express";
import { createSample, getSamples } from "../controllers/sampleController.js";

const router = express.Router();

router.get("/", getSamples);
router.post("/", createSample);

export default router;
