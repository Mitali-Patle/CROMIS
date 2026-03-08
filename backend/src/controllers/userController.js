import User from "../models/User.js";
<<<<<<< HEAD
import bcrypt from "bcryptjs";

// ======================================
// 1. CREATE USER (ADMIN ONLY)
// ======================================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err });
  }
};

// ======================================
// 2. GET ALL USERS (ADMIN ONLY)
=======

// ======================================
// 1. GET ALL USERS (ADMIN ONLY)
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
// ======================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};

// ======================================
// 2. GET ONE USER BY ID
// ======================================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err });
  }
};

// ======================================
// 3. UPDATE USER (name, email, role)
// ======================================
export const updateUser = async (req, res) => {
  try {
    const allowed = ["name", "email", "role"];
    const update = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err });
  }
};

// ======================================
// 4. DELETE USER (PERMANENT DELETE)
// ======================================
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err });
  }
};
