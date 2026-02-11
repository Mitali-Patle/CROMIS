import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // "14:00" (HH:MM, 24-hour)
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates HH:MM format
    },
    endTime: {
      type: String, // "16:00" (HH:MM, 24-hour)
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates HH:MM format
    },
    attachments: {
      type: [String],
      default: [],
    },
    groupId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "expired"],
      default: "pending",
    },
    // 🔒 Internal Admin-Only Comments (NOT visible to students/faculty)
    comments: [
      {
        text: {
          type: String,
          required: true,
          maxlength: 1000,
          trim: true,
        },
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Approval fields
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    // NEW: Priority field for faculty override (Epic 2 Enhancement)
    // 1 = student, 2 = faculty, 3 = admin
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
  },
  { timestamps: true },
);

// Indexes for efficient queries
bookingRequestSchema.index({ resource: 1, date: 1, status: 1 });
bookingRequestSchema.index({ requester: 1, date: -1 });
bookingRequestSchema.index({ priority: -1 }); // NEW: Index for priority queries

export default mongoose.model("BookingRequest", bookingRequestSchema);
