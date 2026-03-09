import BookingRequest from "../models/BookingRequest.js";
import { logAction } from "../controllers/auditController.js";

/**
 * Story 12: Auto-Expire Stale Requests
 * Any 'pending' request older than 7 days is automatically marked as 'expired'.
 * This can be called by a cron job or an admin trigger.
 */
export const autoExpireRequests = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find stale pending bookings
    const staleBookings = await BookingRequest.find({
      status: "pending",
      createdAt: { $lt: sevenDaysAgo },
    });

    if (staleBookings.length === 0) {
      console.log("No stale bookings to expire.");
      return 0;
    }

    let systemAdminId = null;
    if (staleBookings.length > 0) {
      const User = (await import("../models/User.js")).default;
      const admin = await User.findOne({ role: "admin" });
      systemAdminId = admin ? admin._id : null;
    }

    let expiredCount = 0;
    for (const booking of staleBookings) {
      const prevState = booking.toObject();
      
      booking.status = "expired";
      booking.approvedBy = null;
      booking.approvedAt = null;
      booking.rejectedBy = null;
      booking.rejectedAt = null;
      
      await booking.save();
      expiredCount++;

      if (systemAdminId) {
        await logAction({
          adminId: systemAdminId,
          proposalId: booking._id,
          action: "expire",
          note: "Auto-expired by system (7+ days stale)",
          newState: booking.toObject(),
        });
      }
    }

    console.log(`Auto-expired ${expiredCount} bookings.`);
    return expiredCount;
  } catch (err) {
    console.error("autoExpireRequests error:", err);
    throw err;
  }
};
