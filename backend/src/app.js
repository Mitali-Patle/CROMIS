import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes under /api
app.use("/api", routes);

export default app;
