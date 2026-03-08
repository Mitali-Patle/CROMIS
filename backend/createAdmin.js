import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

// 🔗 MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/cromis", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createUsers = async () => {
  try {
    // ❗ Clear existing admin/faculty (optional)
    await User.deleteMany({ role: { $in: ["admin", "faculty"] } });

    // 🔐 Passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const facultyPassword = await bcrypt.hash("faculty123", 10);

    // 👤 Admin user
    const admin = new User({
      name: "Admin",
      email: "admin@cromis.com",
      password: adminPassword,
      role: "admin",
    });

    // 👤 Faculty user
    const faculty = new User({
      name: "Faculty",
      email: "faculty@cromis.com",
      password: facultyPassword,
      role: "faculty",
    });

    await admin.save();
    await faculty.save();

    console.log("✅ Admin & Faculty created successfully");
    console.log("Admin → admin@cromis.com | admin123");
    console.log("Faculty → faculty@cromis.com | faculty123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating users:", err);
    process.exit(1);
  }
};

createUsers();
