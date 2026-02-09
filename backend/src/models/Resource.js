import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Admin can type anything: room, hall, lab, sports, machine, equipment, etc.
    type: {
      type: String,
      required: true,
      trim: true,
    },

    location: { type: String, required: true },

    capacity: { type: Number, default: 1 },

    description: { type: String, trim: true },

    availableFrom: { type: String }, // Example: "08:00"
    availableTo: { type: String }, // Example: "18:00"

    tags: [String],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Resource", resourceSchema);
