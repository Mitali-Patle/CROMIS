import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const BookingList = ({
  bookings,
  mode,
  onApprove,
  onReject,
  onUpdateStatus,
}) => {
  const [editingStatus, setEditingStatus] = useState(null);
  const [loading, setLoading] = useState({});

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
    setLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await apiRequest(`/bookings/${bookingId}`, "PATCH", {
        status: "approved",
      });
      onApprove?.(bookingId);
      window.location.reload(); // Reload page
    } catch (err) {
      console.error("Approve error:", err);
      alert("Failed to approve booking");
    }
    setLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  const handleReject = async (bookingId) => {
    setLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await apiRequest(`/bookings/${bookingId}`, "PATCH", {
        status: "rejected",
      });
      onReject?.(bookingId);
      window.location.reload(); // Reload page
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject booking");
    }
    setLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await apiRequest(`/bookings/${bookingId}`, "PATCH", {
        status: newStatus,
      });
      onUpdateStatus?.(bookingId, newStatus);
      setEditingStatus(null);
      window.location.reload(); // Reload page
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
    setLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  const getStatusOptions = () => [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
    { value: "expired", label: "Expired" },
  ];

  // Responsive: Cards on mobile/tablet, table on desktop
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024; // Tablet+ as mobile

  if (isMobile) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bookings ({bookings.length})</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings found.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id || booking.id}
              className="bg-gray-900 rounded-lg border border-gray-700 p-4"
            >
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm font-medium text-white">User</p>
                  <p className="text-xs text-gray-400">
                    {booking.requester?.name || booking.user}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.requester?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Resource</p>
                  <p className="text-xs text-gray-400">
                    {booking.resource?.name || booking.resource}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.resource?.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Date & Time</p>
                  <p className="text-xs text-gray-400">{booking.date}</p>
                  <p className="text-xs text-gray-500">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {mode === "approval" && booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(booking._id || booking.id)}
                      disabled={loading[booking._id || booking.id]}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {loading[booking._id || booking.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        "Approve"
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(booking._id || booking.id)}
                      disabled={loading[booking._id || booking.id]}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      {loading[booking._id || booking.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        "Reject"
                      )}
                    </button>
                  </>
                )}
                {(mode === "history" || booking.status !== "pending") && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setEditingStatus(
                          editingStatus === (booking._id || booking.id)
                            ? null
                            : booking._id || booking.id,
                        )
                      }
                      className="w-full p-2 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition"
                    >
                      <MoreVertical className="w-4 h-4 mr-2" />
                      Edit Status
                    </button>
                    {editingStatus === (booking._id || booking.id) && (
                      <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-10 min-w-[120px] w-full">
                        {getStatusOptions().map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleStatusUpdate(
                                booking._id || booking.id,
                                option.value,
                              )
                            }
                            disabled={
                              loading[booking._id || booking.id] ||
                              option.value === booking.status
                            }
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Desktop Table
  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">
        Bookings ({bookings.length})
      </h3>
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-4 text-left text-sm font-medium text-gray-300">
                User
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">
                Resource
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">
                Date
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">
                Time
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">
                Status
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const bookingId = booking._id || booking.id;
              return (
                <tr key={bookingId} className="border-t border-gray-700">
                  <td className="p-4">
                    <span className="text-white font-medium">
                      {booking.requester?.name || booking.user}
                    </span>
                    <p className="text-xs text-gray-500">
                      {booking.requester?.email || "N/A"}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-medium">
                      {booking.resource?.name || booking.resource}
                    </span>
                    <p className="text-xs text-gray-500">
                      {booking.resource?.location || "N/A"}
                    </p>
                  </td>
                  <td className="p-4">{booking.date}</td>
                  <td className="p-4">
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {mode === "approval" && booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(bookingId)}
                            disabled={loading[bookingId]}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            {loading[bookingId] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(bookingId)}
                            disabled={loading[bookingId]}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 transition"
                          >
                            {loading[bookingId] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </>
                      )}
                      {(mode === "history" || booking.status !== "pending") && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setEditingStatus(
                                editingStatus === bookingId ? null : bookingId,
                              )
                            }
                            className="p-2 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {editingStatus === bookingId && (
                            <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-10 min-w-[120px]">
                              {getStatusOptions().map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    handleStatusUpdate(bookingId, option.value)
                                  }
                                  disabled={
                                    loading[bookingId] ||
                                    option.value === booking.status
                                  }
                                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="p-4 text-center text-gray-500">No bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default BookingList;
