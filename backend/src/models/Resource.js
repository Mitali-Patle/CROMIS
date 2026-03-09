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
    building: { type: String, trim: true },  // Story 9: split location
    room: { type: String, trim: true },      // Story 9: split location

    capacity: { type: Number, default: 1 },

    description: { type: String, trim: true },

    availableFrom: { type: String }, // Example: "08:00"
    availableTo: { type: String }, // Example: "18:00"

    tags: [String],

    imageUrl: { type: String }, // Stores the path to the uploaded image

    // Story 8: Upload Documents / Blueprints
    documents: [{ type: String }],

    // Story 10: Resource Instructions / Guidelines
    instructions: { type: String, maxlength: 2000, trim: true },

    // Story 12: Temporarily Disable (Maintenance Mode)
    maintenanceReason: { type: String, trim: true },
    maintenanceEndDate: { type: Date },

    // Story 14: Resource Ownership (Admin-only internal note)
    ownerNotes: { type: String, maxlength: 100, trim: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Resource", resourceSchema);
