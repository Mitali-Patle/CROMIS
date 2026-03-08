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
<<<<<<< HEAD
    groupId: {
      type: String,
      default: null,
    },
=======
     groupId: {
  type: String,
  default: null,
},
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "expired"],
      default: "pending",
    },
    // 🔒 Internal Admin-Only Comments (NOT visible to students/faculty)
<<<<<<< HEAD
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
=======
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
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

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
<<<<<<< HEAD
    // 💬 Admin comment visible to the student/faculty who submitted the booking
    adminComment: {
      type: String,
      default: "",
      trim: true,
    },
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
  },
  { timestamps: true },
);

// Indexes for efficient queries
bookingRequestSchema.index({ resource: 1, date: 1, status: 1 });
bookingRequestSchema.index({ requester: 1, date: -1 });

export default mongoose.model("BookingRequest", bookingRequestSchema);
