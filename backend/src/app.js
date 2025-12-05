import express from "express";
import sampleRoutes from "./routes/index.js";

const app = express();

// Parse JSON
app.use(express.json());

// Routes
app.use("/api/sample", sampleRoutes);

export default app;
