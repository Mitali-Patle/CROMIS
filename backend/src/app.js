import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

const app = express();

// ---------- Middleware (ORDER MATTERS) ----------
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// ---------- Routes ----------
app.use("/api", routes);

export default app;
