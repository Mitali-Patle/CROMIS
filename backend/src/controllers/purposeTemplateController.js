import PurposeTemplate from "../models/PurposeTemplate.js";

export const getTemplates = async (req, res) => {
  const role = req.user.role;
  const templates = await PurposeTemplate.find({
    role: { $in: [role, "both"] },
  });
  res.json(templates);
};

export const createTemplate = async (req, res) => {
  const { text, role } = req.body;
  const t = await PurposeTemplate.create({ text, role });
  res.status(201).json(t);
};
