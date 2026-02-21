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
    origin: ["http://localhost:3000", "https://cromis.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// ---------- Routes ----------
app.use("/api", routes);

export default app;
