import mongoose from "mongoose";

const draftProposalSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null,
    },

    date: {
      type: Date,
      default: null,
    },

    startTime: {
      type: String,
      default: null,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },

    endTime: {
      type: String,
      default: null,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },

    purpose: {
      type: String,
      default: "",
      trim: true,
    },

    attachments: {
      type: [String],
      default: [],
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// 🔥 Auto-delete expired drafts after 14 days
draftProposalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Speed up queries
draftProposalSchema.index({ requester: 1, createdAt: -1 });

export default mongoose.model("DraftProposal", draftProposalSchema);
