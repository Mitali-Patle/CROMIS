import Sample from "../models/sampleModel.js";

export const createSample = async (req, res) => {
  try {
    const sample = await Sample.create(req.body);
    res.json({ success: true, data: sample });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSamples = async (req, res) => {
  try {
    const samples = await Sample.find();
    res.json({ success: true, data: samples });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
