import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const BookingList = ({
  bookings,
  mode,
  onApprove,
  onReject,
  onUpdateStatus,
  onRefresh,
}) => {
  const [editingStatus, setEditingStatus] = useState(null);
  const [loading, setLoading] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState({});

  /* 🔐 ROLE CHECK (ADMIN ONLY) */
  const role =
    typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((r) => r.startsWith("role="))
          ?.split("=")[1]
      : null;

  const isAdmin = role === "admin";

  const getStatusIcon = (status) => {
    if (status === "approved")
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "rejected")
      return <XCircle className="w-4 h-4 text-red-600" />;
    if (status === "cancelled")
      return <XCircle className="w-4 h-4 text-gray-400" />;
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const handleApprove = async (bookingId) => {
    setLoading((p) => ({ ...p, [bookingId]: true }));
    await apiRequest(`/bookings/${bookingId}`, "PATCH", {
      status: "approved",
    });
    onApprove?.(bookingId);
    setLoading((p) => ({ ...p, [bookingId]: false }));
  };

  const handleReject = async (bookingId) => {
    setLoading((p) => ({ ...p, [bookingId]: true }));
    await apiRequest(`/bookings/${bookingId}`, "PATCH", {
      status: "rejected",
    });
    onReject?.(bookingId);
    setLoading((p) => ({ ...p, [bookingId]: false }));
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setLoading((p) => ({ ...p, [bookingId]: true }));
    await apiRequest(`/bookings/${bookingId}`, "PATCH", {
      status: newStatus,
    });
    onUpdateStatus?.(bookingId, newStatus);
    setEditingStatus(null);
    setLoading((p) => ({ ...p, [bookingId]: false }));
  };

  /* ======================
     BATCH APPROVAL (NEW)
     ====================== */
  const handleBatchApprove = async (groupId) => {
    try {
      setLoading((p) => ({ ...p, [groupId]: true }));
      await apiRequest("/bookings/batch", "PATCH", {
        groupId,
        status: "approved",
      });
      onRefresh?.(); // Refresh all data instead of calling single-item handler
    } catch (err) {
      console.error("Batch Approve Error:", err);
      alert(err.message || "Failed to approve group");
    } finally {
      setLoading((p) => ({ ...p, [groupId]: false }));
    }
  };

  const handleBatchReject = async (groupId) => {
    try {
      setLoading((p) => ({ ...p, [groupId]: true }));
      await apiRequest("/bookings/batch", "PATCH", {
        groupId,
        status: "rejected",
      });
      onRefresh?.(); // Refresh all data
    } catch (err) {
      console.error("Batch Reject Error:", err);
      alert(err.message || "Failed to reject group");
    } finally {
      setLoading((p) => ({ ...p, [groupId]: false }));
    }
  };

  /* ======================
     GROUP BOOKINGS BY groupId
     ====================== */
  const groupedBookings = React.useMemo(() => {
    const groups = {};
    const singles = [];

    bookings.forEach((booking) => {
      if (booking.groupId) {
        if (!groups[booking.groupId]) {
          groups[booking.groupId] = [];
        }
        groups[booking.groupId].push(booking);
      } else {
        singles.push(booking);
      }
    });

    return { groups, singles };
  }, [bookings]);

  /* ======================
     ADMIN COMMENT (Story 15)
     ====================== */
  const saveAdminComment = async (bookingId) => {
    await apiRequest(`/bookings/${bookingId}`, "PATCH", {
      adminComment: commentText,
    });

    setLocalComments((prev) => ({
      ...prev,
      [bookingId]: commentText,
    }));

    setActiveCommentId(null);
    setCommentText("");
  };

  const getStatusOptions = () => [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" },
  ];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  /* ======================= MOBILE ======================= */
  if (isMobile) {
    return (
      <div className="space-y-4">
        {bookings.map((booking) => {
          const id = booking._id;
          const comment = localComments[id] ?? booking.adminComment ?? "";

          return (
            <div
              key={id}
              className="bg-black border border-gray-700 rounded-lg p-4"
            >
              <p className="text-white font-medium">{booking.resource?.name}</p>
              <p className="text-xs text-gray-400">
                {booking.requester?.name} •{" "}
                <span className="text-blue-300">
                  {booking.requester?.role || "N/A"}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                {booking.date} | {booking.startTime} – {booking.endTime}
              </p>

              <span
                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${getStatusColor(
                  booking.status,
                )}`}
              >
                {booking.status.toUpperCase()}
              </span>

              {isAdmin && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setActiveCommentId(id);
                      setCommentText(comment);
                    }}
                    className="text-blue-400 text-sm flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Admin Comment
                  </button>

                  {activeCommentId === id && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        maxLength={1000}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                        placeholder="Internal admin note (not visible to users)"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveAdminComment(id)}
                          className="bg-white text-black px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setActiveCommentId(null)}
                          className="bg-gray-700 px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ======================= DESKTOP ======================= */
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-black border border-gray-700 rounded-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-4 text-left text-gray-300">User</th>
            <th className="p-4 text-left text-gray-300">Role</th>
            <th className="p-4 text-left text-gray-300">Resource</th>
            <th className="p-4 text-left text-gray-300">Date</th>
            <th className="p-4 text-left text-gray-300">Time</th>
            <th className="p-4 text-left text-gray-300">Status</th>
            <th className="p-4 text-left text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Render Grouped Bookings */}
          {Object.entries(groupedBookings.groups).map(
            ([groupId, groupBookings]) => {
              const firstBooking = groupBookings[0];
              const allPending = groupBookings.every(
                (b) => b.status === "pending",
              );

              return (
                <React.Fragment key={groupId}>
                  {/* Group Header Row */}
                  <tr className="border-t-2 border-blue-500 bg-gray-800">
                    <td colSpan="7" className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-blue-400 font-semibold">
                            📅 Multi-Day/Recurring Group ({groupBookings.length}{" "}
                            bookings)
                          </span>
                          <span className="ml-3 text-gray-400 text-sm">
                            {firstBooking.requester?.name} (
                            {firstBooking.requester?.role || "N/A"}) •{" "}
                            {firstBooking.resource?.name}
                          </span>
                        </div>
                        {mode === "approval" && allPending && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBatchApprove(groupId)}
                              disabled={loading[groupId]}
                              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                            >
                              {loading[groupId] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve Group
                            </button>
                            <button
                              onClick={() => handleBatchReject(groupId)}
                              disabled={loading[groupId]}
                              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                            >
                              {loading[groupId] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject Group
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Individual Bookings in Group */}
                  {groupBookings.map((booking) => {
                    const id = booking._id;
                    const comment =
                      localComments[id] ?? booking.adminComment ?? "";

                    return (
                      <tr
                        key={id}
                        className="border-t border-gray-700 bg-gray-850"
                      >
                        <td className="p-4 pl-8 text-gray-400">↳</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                            {booking.requester?.role || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">{booking.resource?.name}</td>
                        <td className="p-4">{booking.date}</td>
                        <td className="p-4">
                          {booking.startTime} – {booking.endTime}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setActiveCommentId(id);
                                setCommentText(comment);
                              }}
                              className="text-blue-400 text-sm flex items-center gap-1"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            },
          )}

          {/* Render Single Bookings */}
          {groupedBookings.singles.map((booking) => {
            const id = booking._id;
            const comment = localComments[id] ?? booking.adminComment ?? "";

            return (
              <tr key={id} className="border-t border-gray-700 align-top">
                <td className="p-4">{booking.requester?.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                    {booking.requester?.role || "N/A"}
                  </span>
                </td>
                <td className="p-4">{booking.resource?.name}</td>
                <td className="p-4">{booking.date}</td>
                <td className="p-4">
                  {booking.startTime} – {booking.endTime}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      booking.status,
                    )}`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 space-y-2">
                  {mode === "approval" && booking.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(id)}
                        className="bg-green-600 px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(id)}
                        className="bg-red-600 px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <div>
                      <button
                        onClick={() => {
                          setActiveCommentId(id);
                          setCommentText(comment);
                        }}
                        className="text-blue-400 text-sm flex items-center gap-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Admin Comment
                      </button>

                      {activeCommentId === id && (
                        <div className="mt-2 space-y-2">
                          <textarea
                            maxLength={1000}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveAdminComment(id)}
                              className="bg-white text-black px-3 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setActiveCommentId(null)}
                              className="bg-gray-700 px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;
