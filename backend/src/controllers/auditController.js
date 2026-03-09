import AuditLog from "../models/AuditLog.js";

/**
 * Get all audit logs (Admin only)
 * Filters: adminId, proposalId, action, date range
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { adminId, proposalId, action, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (proposalId) filter.proposalId = proposalId;
    if (action) filter.action = action;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .populate("adminId", "name email")
      .populate({
        path: "proposalId",
        populate: { path: "resource", select: "name" }
      })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalLogs: count
    });
  } catch (err) {
    console.error("getAuditLogs error:", err);
    res.status(500).json({ error: "Server error while fetching audit logs" });
  }
};

/**
 * Internal helper to create a log entry
 */
export const logAction = async ({ adminId, proposalId, action, note, previousState, newState }) => {
  try {
    await AuditLog.create({
      adminId,
      proposalId,
      action,
      note,
      previousState,
      newState
    });
  } catch (err) {
    console.error("Audit logging failed:", err);
  }
};
