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
<<<<<<< HEAD
    origin: true, // Reflect request origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
=======
    origin: process.env.CLIENT_URL || "http://localhost:3000",
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
    credentials: true,
  }),
);

// ---------- Routes ----------
app.use("/api", routes);

export default app;
