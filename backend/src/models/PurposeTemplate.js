import mongoose from "mongoose";

const purposeTemplateSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "faculty", "both"],
      default: "both",
    },
  },
  { timestamps: true },
);

export default mongoose.model("PurposeTemplate", purposeTemplateSchema);
