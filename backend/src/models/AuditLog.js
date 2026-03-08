import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookingRequest",
      required: true,
    },
    action: {
      type: String,
      enum: ["approve", "reject", "edit", "expire", "cancel", "approved", "rejected", "expired", "cancelled"],
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    previousState: {
      type: Object, // Partial booking object before change
    },
    newState: {
      type: Object, // Partial booking object after change
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Index for searchable logs
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ proposalId: 1, timestamp: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
