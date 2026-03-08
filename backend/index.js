import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./src/app.js";

import { initCronJobs } from "./src/utils/cronService.js";

const PORT = process.env.PORT || 5000;

// connect DB
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
<<<<<<< HEAD
});
=======
});
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
