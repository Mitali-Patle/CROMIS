import mongoose from "mongoose";
import BookingRequest from "../models/BookingRequest.js";
import Resource from "../models/Resource.js";

/* ---------------------------------------------------
<<<<<<< HEAD
   Helper: Calculate duration in hours
--------------------------------------------------- */
const getDurationHours = (startTime, endTime) => {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  return endH + endM / 60 - (startH + startM / 60);
};

/* ---------------------------------------------------
   1. Daily Utilization (Last 7 Days)
--------------------------------------------------- */
export const getDailyUtilization = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await BookingRequest.aggregate([
      {
        $match: {
          status: { $in: ["approved"] },
          date: { $gte: sevenDaysAgo },
          startTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
          endTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        },
      },
      {
        $addFields: {
          startParts: { $split: ["$startTime", ":"] },
          endParts: { $split: ["$endTime", ":"] },
        },
      },
      {
        $addFields: {
          durationHours: {
            $subtract: [
              {
                $add: [
                  { $toInt: { $arrayElemAt: ["$endParts", 0] } },
                  {
                    $divide: [
                      { $toInt: { $arrayElemAt: ["$endParts", 1] } },
                      60,
                    ],
                  },
                ],
              },
              {
                $add: [
                  { $toInt: { $arrayElemAt: ["$startParts", 0] } },
                  {
                    $divide: [
                      { $toInt: { $arrayElemAt: ["$startParts", 1] } },
                      60,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalHours: { $sum: "$durationHours" },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
=======
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
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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
<<<<<<< HEAD
   2. Weekly Utilization (Trends + Summary)
=======
   2. Weekly Utilization (Fixed: Same as above)
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
--------------------------------------------------- */
export const getWeeklyUtilization = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
<<<<<<< HEAD
      { $match: { status: "approved" } },
      {
        $addFields: {
          startParts: { $split: ["$startTime", ":"] },
          endParts: { $split: ["$endTime", ":"] },
        },
      },
      {
        $addFields: {
          durationHours: {
            $subtract: [
              {
                $add: [
                  { $toInt: { $arrayElemAt: ["$endParts", 0] } },
                  {
                    $divide: [
                      { $toInt: { $arrayElemAt: ["$endParts", 1] } },
                      60,
                    ],
                  },
                ],
              },
              {
                $add: [
                  { $toInt: { $arrayElemAt: ["$startParts", 0] } },
                  {
                    $divide: [
                      { $toInt: { $arrayElemAt: ["$startParts", 1] } },
                      60,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek: "$date" },
          },
          totalHours: { $sum: "$durationHours" },
          avgHours: { $avg: "$durationHours" },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
=======
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
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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
<<<<<<< HEAD
   3. Peak Hours (Last 90 Days)
--------------------------------------------------- */
export const getPeakHours = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await BookingRequest.aggregate([
      {
        $match: {
          status: "approved",
          date: { $gte: ninetyDaysAgo },
          startTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        },
      },
      {
        $addFields: {
          hour: {
            $toInt: { $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0] },
          },
        },
      },
      {
        $group: {
          _id: "$hour",
=======
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
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
<<<<<<< HEAD
      { $limit: 5 },
=======
      { $project: { startDateTime: 0 } },
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
    ]);

    res.json(result);
  } catch (err) {
    console.error("getPeakHours:", err);
    res.status(500).json({ message: "Peak hours error", error: err.message });
  }
};

/* ---------------------------------------------------
<<<<<<< HEAD
   4. Underutilized Resources (Last 30 Days)
--------------------------------------------------- */
export const getUnderutilizedResources = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Resource.aggregate([
      { $match: { isActive: true } },
=======
   4. Underutilized Resources (Already good, minor tweak for active)
--------------------------------------------------- */
export const getUnderutilizedResources = async (req, res) => {
  try {
    const result = await Resource.aggregate([
      { $match: { isActive: true } }, // Only active resources
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
      {
        $lookup: {
          from: "bookingrequests",
          let: { resId: "$_id" },
          pipeline: [
            {
              $match: {
<<<<<<< HEAD
                $expr: {
                  $and: [
                    { $eq: ["$resource", "$$resId"] },
                    { $eq: ["$status", "approved"] },
                    { $gte: ["$date", thirtyDaysAgo] },
                  ],
                },
              },
            },
          ],
          as: "bookings",
=======
                $expr: { $eq: ["$resource", "$$resId"] },
                status: { $in: ["pending", "approved"] }, // Only active bookings
              },
            },
            { $count: "totalBookings" },
          ],
          as: "bookingData",
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
        },
      },
      {
        $addFields: {
<<<<<<< HEAD
          bookingCount: { $size: "$bookings" },
        },
      },
      {
        $project: {
          name: 1,
          type: 1,
          bookingCount: 1,
          underused: { $lt: ["$bookingCount", 2] }, // Alert if < 2 bookings in 30 days
        },
      },
      { $sort: { bookingCount: 1 } },
=======
          totalBookings: {
            $ifNull: [{ $arrayElemAt: ["$bookingData.totalBookings", 0] }, 0],
          },
        },
      },
      { $sort: { totalBookings: 1 } }, // Least used first
      { $project: { bookingData: 0 } }, // Clean up
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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
<<<<<<< HEAD
   5. Usage by Role (Last Month Trends)
--------------------------------------------------- */
export const getUsageByRole = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await BookingRequest.aggregate([
      {
        $match: {
          status: "approved",
          date: { $gte: startOfMonth },
        },
      },
=======
   5. Usage by Role (student vs faculty) (Fixed requester)
--------------------------------------------------- */
export const getUsageByRole = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
      { $match: { status: { $in: ["pending", "approved"] } } },
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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
<<<<<<< HEAD
        $match: {
          "userInfo.role": { $in: ["student", "faculty"] },
        },
      },
      {
        $group: {
          _id: "$userInfo.role",
          count: { $sum: 1 },
          resources: { $addToSet: "$resource" },
        },
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          uniqueResources: { $size: "$resources" },
        },
      },
=======
        $group: {
          _id: "$userInfo.role",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
    ]);

    res.json(result);
  } catch (err) {
    console.error("getUsageByRole:", err);
    res.status(500).json({ message: "Role usage error", error: err.message });
  }
};

/* ---------------------------------------------------
<<<<<<< HEAD
   6. Resource Heatmap (Global Resources x Hours)
--------------------------------------------------- */
export const getResourceHeatmap = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
=======
   6. Resource Heatmap (hour-wise usage) (Fixed: Same)
--------------------------------------------------- */
export const getResourceHeatmap = async (req, res) => {
  try {
    const resourceId = new mongoose.Types.ObjectId(req.params.resourceId);
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

    const result = await BookingRequest.aggregate([
      {
        $match: {
<<<<<<< HEAD
          status: "approved",
          date: { $gte: thirtyDaysAgo },
          startTime: { $regex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        },
      },
      {
        $addFields: {
          hour: {
            $toInt: { $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0] },
          },
          dayOfWeek: { $dayOfWeek: "$date" }, // 1 (Sun) to 7 (Sat)
        },
      },
      {
        $group: {
          _id: { day: "$dayOfWeek", hour: "$hour" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1, "_id.hour": 1 } },
=======
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
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
    ]);

    res.json(result);
  } catch (err) {
    console.error("getResourceHeatmap:", err);
    res.status(500).json({ message: "Heatmap error", error: err.message });
  }
};
<<<<<<< HEAD

/* ---------------------------------------------------
   7. Resource Occupancy Timeline (Gantt - Next 14 Days)
--------------------------------------------------- */
export const getResourceOccupancyTimeline = async (req, res) => {
  try {
    const now = new Date();
    const fourteenDaysAhead = new Date();
    fourteenDaysAhead.setDate(now.getDate() + 14);

    const result = await Resource.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "bookingrequests",
          let: { resId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$resource", "$$resId"] },
                    { $in: ["$status", ["approved", "pending"]] },
                    { $gte: ["$date", now] },
                    { $lte: ["$date", fourteenDaysAhead] },
                  ],
                },
              },
            },
            { $sort: { date: 1, startTime: 1 } },
          ],
          as: "timeline",
        },
      },
      {
        $project: {
          name: 1,
          timeline: {
            $map: {
              input: "$timeline",
              as: "t",
              in: {
                date: "$$t.date",
                startTime: "$$t.startTime",
                endTime: "$$t.endTime",
                status: "$$t.status",
              },
            },
          },
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getResourceOccupancyTimeline:", err);
    res.status(500).json({ message: "Timeline error", error: err.message });
  }
};

/* ---------------------------------------------------
   8. Top 5 Most Booked Resources (All Time)
--------------------------------------------------- */
export const getTopResources = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$resource",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "resources",
          localField: "_id",
          foreignField: "_id",
          as: "resourceInfo",
        },
      },
      { $unwind: "$resourceInfo" },
      {
        $project: {
          name: "$resourceInfo.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    res.json(result);
  } catch (err) {
    console.error("getTopResources:", err);
    res
      .status(500)
      .json({ message: "Top resources error", error: err.message });
  }
};

/* ---------------------------------------------------
   9. Overall Booking Status Distribution
--------------------------------------------------- */
export const getOverallStatus = async (req, res) => {
  try {
    const result = await BookingRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    console.error("getOverallStatus:", err);
    res
      .status(500)
      .json({ message: "Overall status error", error: err.message });
  }
};
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
