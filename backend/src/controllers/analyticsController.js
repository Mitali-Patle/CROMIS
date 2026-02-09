import mongoose from "mongoose";
import BookingRequest from "../models/BookingRequest.js";
import Resource from "../models/Resource.js";

/* ---------------------------------------------------
   1. Daily Utilization (Fixed: Early filter + time validation)
--------------------------------------------------- */
export const getDailyUtilization = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
      // Early filter for active + valid time
      {
        $match: {
          status: { $in: ["pending", "approved"] },
          startTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        },
      },
      // Build full start datetime safely
      {
        $addFields: {
          startDateTime: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$startTime", null] },
                  { $ne: ["$startTime", ""] },
                ],
              },
              then: {
                $dateFromParts: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                  day: { $dayOfMonth: "$date" },
                  hour: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0],
                    },
                  },
                  minute: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 1],
                    },
                  },
                  second: 0,
                  millisecond: 0,
                },
              },
              else: null,
            },
          },
        },
      },
      { $match: { startDateTime: { $ne: null } } }, // Skip invalid dates
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startDateTime" },
          },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { startDateTime: 0 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getDailyUtilization:", err);
    res
      .status(500)
      .json({ message: "Daily utilization error", error: err.message });
  }
};

/* ---------------------------------------------------
   2. Weekly Utilization (Fixed: Same as above)
--------------------------------------------------- */
export const getWeeklyUtilization = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
      // Early filter
      {
        $match: {
          status: { $in: ["pending", "approved"] },
          startTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        },
      },
      // Safe datetime build
      {
        $addFields: {
          startDateTime: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$startTime", null] },
                  { $ne: ["$startTime", ""] },
                ],
              },
              then: {
                $dateFromParts: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                  day: { $dayOfMonth: "$date" },
                  hour: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0],
                    },
                  },
                  minute: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 1],
                    },
                  },
                  second: 0,
                  millisecond: 0,
                },
              },
              else: null,
            },
          },
        },
      },
      { $match: { startDateTime: { $ne: null } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$startDateTime" },
            week: { $isoWeek: "$startDateTime" },
          },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      { $project: { startDateTime: 0 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getWeeklyUtilization:", err);
    res
      .status(500)
      .json({ message: "Weekly utilization error", error: err.message });
  }
};

/* ---------------------------------------------------
   3. Peak Hours (Fixed: Same)
--------------------------------------------------- */
export const getPeakHours = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
      // Early filter
      {
        $match: {
          status: { $in: ["pending", "approved"] },
          startTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        },
      },
      // Safe datetime
      {
        $addFields: {
          startDateTime: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$startTime", null] },
                  { $ne: ["$startTime", ""] },
                ],
              },
              then: {
                $dateFromParts: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                  day: { $dayOfMonth: "$date" },
                  hour: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0],
                    },
                  },
                  minute: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 1],
                    },
                  },
                  second: 0,
                  millisecond: 0,
                },
              },
              else: null,
            },
          },
        },
      },
      { $match: { startDateTime: { $ne: null } } },
      {
        $group: {
          _id: { $hour: "$startDateTime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $project: { startDateTime: 0 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getPeakHours:", err);
    res.status(500).json({ message: "Peak hours error", error: err.message });
  }
};

/* ---------------------------------------------------
   4. Underutilized Resources (Already good, minor tweak for active)
--------------------------------------------------- */
export const getUnderutilizedResources = async (req, res) => {
  try {
    const result = await Resource.aggregate([
      { $match: { isActive: true } }, // Only active resources
      {
        $lookup: {
          from: "bookingrequests",
          let: { resId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$resource", "$$resId"] },
                status: { $in: ["pending", "approved"] }, // Only active bookings
              },
            },
            { $count: "totalBookings" },
          ],
          as: "bookingData",
        },
      },
      {
        $addFields: {
          totalBookings: {
            $ifNull: [{ $arrayElemAt: ["$bookingData.totalBookings", 0] }, 0],
          },
        },
      },
      { $sort: { totalBookings: 1 } }, // Least used first
      { $project: { bookingData: 0 } }, // Clean up
    ]);

    res.json(result);
  } catch (err) {
    console.error("getUnderutilizedResources:", err);
    res
      .status(500)
      .json({ message: "Underutilized resource error", error: err.message });
  }
};

/* ---------------------------------------------------
   5. Usage by Role (student vs faculty) (Fixed requester)
--------------------------------------------------- */
export const getUsageByRole = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
      { $match: { status: { $in: ["pending", "approved"] } } },
      {
        $lookup: {
          from: "users",
          localField: "requester",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $group: {
          _id: "$userInfo.role",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getUsageByRole:", err);
    res.status(500).json({ message: "Role usage error", error: err.message });
  }
};

/* ---------------------------------------------------
   6. Resource Heatmap (hour-wise usage) (Fixed: Same)
--------------------------------------------------- */
export const getResourceHeatmap = async (req, res) => {
  try {
    const resourceId = new mongoose.Types.ObjectId(req.params.resourceId);

    const result = await BookingRequest.aggregate([
      {
        $match: {
          resource: resourceId,
          status: { $in: ["pending", "approved"] },
          startTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        },
      },
      // Safe datetime build
      {
        $addFields: {
          startDateTime: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$startTime", null] },
                  { $ne: ["$startTime", ""] },
                ],
              },
              then: {
                $dateFromParts: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                  day: { $dayOfMonth: "$date" },
                  hour: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0],
                    },
                  },
                  minute: {
                    $toInt: {
                      $arrayElemAt: [{ $split: ["$startTime", ":"] }, 1],
                    },
                  },
                  second: 0,
                  millisecond: 0,
                },
              },
              else: null,
            },
          },
        },
      },
      { $match: { startDateTime: { $ne: null } } },
      {
        $group: {
          _id: { $hour: "$startDateTime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { startDateTime: 0 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getResourceHeatmap:", err);
    res.status(500).json({ message: "Heatmap error", error: err.message });
  }
};
