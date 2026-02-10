import cron from "node-cron";
import BookingRequest from "../models/BookingRequest.js";

const EXPIRATION_DAYS = 7;

/**
 * Initialize Cron Jobs
 */
export const initCronJobs = () => {
    console.log("⏰ Initializing Cron Jobs...");

    // Run every day at midnight: 0 0 * * *
    cron.schedule("0 0 * * *", async () => {
        console.log("Running Daily Cleanup: Expiring Stale Requests...");

        try {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() - EXPIRATION_DAYS);

            // Find pending bookings older than expiration date
            const result = await BookingRequest.updateMany(
                {
                    status: "pending",
                    createdAt: { $lt: expirationDate },
                },
                {
                    $set: {
                        status: "expired",
                        rejectedAt: new Date(), // Mark time of expiration
                        rejectionReason: "Auto-expired due to inactivity > 7 days",
                    },
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Expired ${result.modifiedCount} stale bookings.`);
            } else {
                console.log("No stale bookings found to expire.");
            }
        } catch (err) {
            console.error("❌ Error running cron job:", err);
        }
    });
};
