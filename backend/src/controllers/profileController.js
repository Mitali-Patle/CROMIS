import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* GET /auth/me — return current user's public profile */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

/* PATCH /auth/me — update current user's name */
export const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true },
    ).select("name email role");

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
