import User from "../models/User.js";

// ======================================
// 1. GET ALL USERS (ADMIN ONLY)
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
