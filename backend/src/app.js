import cors from "cors";
import express from "express";
import sampleRoutes from "./routes/index.js";

const app = express();
app.use(cors());

// Parse JSON
app.use(express.json());

// Routes
app.use("/api/sample", sampleRoutes);

export default app;
