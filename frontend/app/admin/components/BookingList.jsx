import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Loader2,
  MessageSquare,
  FileText,
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

  // Filters (Story 11, 14)
  const [filters, setFilters] = useState({
    status: "",
    resource: "",
    startDate: "",
    endDate: "",
  });

  // Rejection Modal State (Story 2)
  const [rejectModal, setRejectModal] = useState({ show: false, id: null, note: "" });

  // Details Modal State (Story 5)
  const [detailsModal, setDetailsModal] = useState({ show: false, booking: null, conflicts: [], series: [], loading: false });

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
      return <CheckCircle className="w-4 h-4 text-white" />;
    if (status === "rejected")
      return <XCircle className="w-4 h-4 text-gray-400" />;
    if (status === "cancelled")
      return <XCircle className="w-4 h-4 text-gray-500" />;
    return <Clock className="w-4 h-4 text-gray-300" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-white bg-gray-700";
      case "rejected":
        return "text-gray-300 bg-gray-800";
      case "cancelled":
        return "text-gray-400 bg-gray-900";
      default:
        return "text-white bg-gray-800";
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
    // Open modal instead of fetching
    setRejectModal({ show: true, id: bookingId, note: "" });
  };

  const submitRejection = async () => {
    const { id, note } = rejectModal;
    if (note.trim().length < 20) {
      alert("Rejection reason must be at least 20 characters.");
      return;
    }

    setLoading((p) => ({ ...p, [id]: true }));
    try {
      await apiRequest(`/bookings/${id}`, "PATCH", {
        status: "rejected",
        rejectionReason: note,
      });
      setRejectModal({ show: false, id: null, note: "" });
      onReject?.(id);
    } catch (err) {
      alert(err.message || "Failed to reject booking");
    } finally {
      setLoading((p) => ({ ...p, [id]: false }));
    }
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
     DETAILS & CONFLICTS (Story 5, 15)
     ====================== */
  const handleViewDetails = async (booking) => {
    try {
      setDetailsModal({ show: true, booking, conflicts: [], series: [], loading: true });
      
      const promises = [apiRequest(`/bookings/${booking._id}/conflicts`)];
      if (booking.groupId) {
        promises.push(apiRequest(`/bookings?groupId=${booking.groupId}`));
      }

      const [confRes, seriesRes] = await Promise.all(promises);
      
      setDetailsModal({ 
        show: true, 
        booking, 
        conflicts: confRes.conflicts || [], 
        series: seriesRes || [],
        loading: false 
      });
    } catch (err) {
      console.error("Fetch details error:", err);
      setDetailsModal((p) => ({ ...p, loading: false }));
    }
  };

  /* ======================
     ADMIN EDIT (Story 8)
     ====================== */
  const [editModal, setEditModal] = useState({ show: false, booking: null });
  const handleAdminEdit = (booking) => {
    setEditModal({ show: true, booking: { ...booking } });
  };
 
  const submitAdminEdit = async () => {
    const { booking } = editModal;
    setLoading((p) => ({ ...p, [booking._id]: true }));
    try {
      await apiRequest(`/bookings/${booking._id}`, "PATCH", {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        purpose: booking.purpose,
      });
      setEditModal({ show: false, booking: null });
      onRefresh?.();
    } catch (err) {
      alert(err.message || "Failed to update booking");
    } finally {
      setLoading((p) => ({ ...p, [booking._id]: false }));
    }
  };

  /* ======================
     GROUP BOOKINGS BY groupId
     ====================== */
  const groupedBookings = React.useMemo(() => {
    const filtered = bookings.filter(b => {
      const matchStatus = !filters.status || b.status === filters.status;
      const matchResource = !filters.resource || b.resource?.name?.toLowerCase().includes(filters.resource.toLowerCase()) || b.resource?._id === filters.resource;
      const matchStart = !filters.startDate || new Date(b.date) >= new Date(filters.startDate);
      const matchEnd = !filters.endDate || new Date(b.date) <= new Date(filters.endDate);
      return matchStatus && matchResource && matchStart && matchEnd;
    });

    const groups = {};
    const singles = [];

    filtered.forEach((booking) => {
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
  }, [bookings, filters]);
  const [savedIndicator, setSavedIndicator] = useState({});

  /* ======================
     ADMIN COMMENT
     ====================== */
  const saveAdminComment = async (bookingId) => {
    try {
      const result = await apiRequest(`/bookings/${bookingId}`, "PATCH", {
        adminComment: commentText,
      });

      console.log("Comment saved:", result.adminComment); // debug

      setLocalComments((prev) => ({
        ...prev,
        [bookingId]: commentText,
      }));

      setSavedIndicator((prev) => ({ ...prev, [bookingId]: true }));
      setTimeout(
        () => setSavedIndicator((prev) => ({ ...prev, [bookingId]: false })),
        3000,
      );

      setActiveCommentId(null);
      setCommentText("");
    } catch (err) {
      console.error("Failed to save comment:", err);
      alert("Failed to save comment: " + (err.message || "Unknown error"));
    }
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

              {booking.purpose && (
                <div className="mt-2 bg-gray-900 border border-gray-700 rounded px-3 py-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">
                    Purpose
                  </p>
                  <p className="text-sm text-gray-200">{booking.purpose}</p>
                </div>
              )}

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
                    className="text-blue-400 text-sm flex items-center gap-1 mt-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {comment
                      ? "Edit Comment (visible to requester)"
                      : "Add Comment (visible to requester)"}
                  </button>

                  {activeCommentId === id && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        maxLength={1000}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                        placeholder="Message visible to the student/faculty..."
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
    <div className="space-y-6">
      {/* Filter Bar (Story 11) */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-wrap gap-4 items-end shadow-lg animate-in fade-in duration-500">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">Search Resource</label>
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 transition-colors outline-none"
            value={filters.resource}
            onChange={(e) => setFilters(p => ({ ...p, resource: e.target.value }))}
          />
        </div>
        <div className="w-40">
          <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">Status</label>
          <select 
            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 transition-colors outline-none appearance-none"
            value={filters.status}
            onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="w-36">
            <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">From Date</label>
            <input 
              type="date" 
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 transition-colors outline-none"
              value={filters.startDate}
              onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
            />
          </div>
          <div className="w-36">
            <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">To Date</label>
            <input 
              type="date" 
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 transition-colors outline-none"
              value={filters.endDate}
              onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
            />
          </div>
        </div>
        <button 
          onClick={() => setFilters({ status: "", resource: "", startDate: "", endDate: "" })}
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full bg-black border border-gray-700 rounded-lg">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-4 text-left text-gray-300">User</th>
            <th className="p-4 text-left text-gray-300">Role</th>
            <th className="p-4 text-left text-gray-300">Resource</th>
            <th className="p-4 text-left text-gray-300">Purpose</th>
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
                    <td colSpan="8" className="p-4">
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
                        <button 
                          onClick={() => handleViewDetails(firstBooking)}
                          className="text-gray-400 hover:text-white text-xs underline px-3"
                        >
                          View Group Summary
                        </button>
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
                        <td className="p-4 max-w-[180px]">
                          <p
                            className="text-sm text-gray-300 truncate"
                            title={booking.purpose}
                          >
                            {booking.purpose || (
                              <span className="text-gray-600 italic">—</span>
                            )}
                          </p>
                        </td>
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="text-gray-400 hover:text-white"
                                title="View Details"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveCommentId(id);
                                  setCommentText(comment);
                                }}
                                className="text-blue-400 text-sm"
                                title="Internal Comment"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
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
                <td className="p-4 max-w-[200px]">
                  <p
                    className="text-sm text-gray-300 truncate"
                    title={booking.purpose}
                  >
                    {booking.purpose || (
                      <span className="text-gray-600 italic">—</span>
                    )}
                  </p>
                </td>
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
                  <button 
                    onClick={() => handleViewDetails(booking)}
                    className="block mt-2 text-[10px] text-gray-500 hover:text-blue-400 transition-colors uppercase font-bold tracking-tighter"
                  >
                    Full Details & Conflicts
                  </button>
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
                      <button
                        onClick={() => handleAdminEdit(booking)}
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="space-y-1">
                      {comment && (
                        <p
                          className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1 max-w-[200px] truncate"
                          title={comment}
                        >
                          💬 {comment}
                        </p>
                      )}
                      {savedIndicator[id] && (
                        <p className="text-xs text-green-400 font-semibold">
                          ✓ Saved
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setActiveCommentId(id);
                          setCommentText(comment);
                        }}
                        className="text-blue-400 text-sm flex items-center gap-1 mt-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {comment ? "Edit Comment" : "Add Comment"}
                      </button>
                      {activeCommentId === id && (
                        <div className="mt-2 space-y-2">
                          <textarea
                            maxLength={1000}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                            placeholder="Message visible to the student/faculty..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveAdminComment(id)}
                              className="bg-white text-black px-3 py-1 rounded text-sm font-medium"
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

      {/* ======================= MODALS ======================= */}

      {/* Rejection Modal (Story 2) */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Reject Proposal</h3>
            <p className="text-sm text-gray-400 mb-6">Please provide a reason for rejection (min 20 chars).</p>
            <textarea
              className="w-full h-32 bg-black border border-gray-700 rounded-xl p-4 text-sm mb-6 focus:border-blue-500 outline-none transition-colors"
              placeholder="Example: The resource is undergoing maintenance during this period..."
              value={rejectModal.note}
              onChange={(e) => setRejectModal(p => ({ ...p, note: e.target.value }))}
            />
            <div className="flex gap-3">
              <button
                onClick={submitRejection}
                disabled={loading[rejectModal.id]}
                className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading[rejectModal.id] ? "Processing..." : "Confirm Rejection"}
              </button>
              <button
                onClick={() => setRejectModal({ show: false, id: null, note: "" })}
                className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Conflict Modal (Story 5, 13, 15) */}
      {detailsModal.show && detailsModal.booking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <h3 className="text-xl font-bold">Proposal Details</h3>
              <button onClick={() => setDetailsModal({ show: false, booking: null, conflicts: [], series: [] })} className="text-gray-400 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-8 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Basic Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-500 font-medium mr-2">Requester:</span> {detailsModal.booking.requester?.name}</p>
                    <p className="text-sm"><span className="text-gray-500 font-medium mr-2">Resource:</span> {detailsModal.booking.resource?.name}</p>
                    <p className="text-sm"><span className="text-gray-500 font-medium mr-2">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(detailsModal.booking.status)}`}>
                        {detailsModal.booking.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Schedule</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-500 font-medium mr-2">Date:</span> {detailsModal.booking.date}</p>
                    <p className="text-sm"><span className="text-gray-500 font-medium mr-2">Time:</span> {detailsModal.booking.startTime} – {detailsModal.booking.endTime}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Purpose of Booking</h4>
                <div className="bg-black/50 border border-gray-800 rounded-xl p-4 text-sm leading-relaxed text-gray-300">
                  {detailsModal.booking.purpose}
                </div>
              </div>

              {/* Attachments (Story 13) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Attachments ({detailsModal.booking.attachments?.length || 0})</h4>
                <div className="flex flex-wrap gap-4">
                  {detailsModal.booking.attachments?.length > 0 ? (
                    detailsModal.booking.attachments.map((file, idx) => (
                      <a key={idx} href={`http://localhost:5000/${file}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-850 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all group">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-gray-300">Document {idx + 1}</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No attachments provided.</p>
                  )}
                </div>
              </div>

              {/* Multi-Day Series (Requirement Enhancement) */}
              {detailsModal.booking.groupId && (
                <div className="space-y-4 border-t border-gray-800 pt-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Multi-Day Series ({detailsModal.series.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detailsModal.series.map(s => (
                      <div key={s._id} className={`p-3 rounded-xl border ${s._id === detailsModal.booking._id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-gray-850 border-gray-800'}`}>
                        <p className="text-xs font-bold">{new Date(s.date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400">{s.startTime} – {s.endTime}</p>
                        <div className="mt-2 flex items-center justify-between">
                           <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getStatusColor(s.status)}`}>{s.status}</span>
                           {s._id === detailsModal.booking._id && <span className="text-[8px] text-blue-400 font-bold uppercase">Current View</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflicts (Story 15) */}
              <div className="space-y-4 border-t border-gray-800 pt-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-red-400">Potential Overlaps ({detailsModal.conflicts.length})</h4>
                {detailsModal.loading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing conflicts...</div>
                ) : detailsModal.conflicts.length > 0 ? (
                  <div className="space-y-3">
                    {detailsModal.conflicts.map(c => (
                      <div key={c._id} className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-red-200">{c.startTime} – {c.endTime}</p>
                          <p className="text-xs text-red-300/60">{c.requester?.name} ({c.requester?.role})</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(c.status)}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-400/80 font-medium">✓ No conflicting proposals found for this slot.</p>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-850 border-t border-gray-800 flex gap-4">
              {detailsModal.booking.status === 'pending' && isAdmin && (
                <>
                  <button onClick={() => { handleApprove(detailsModal.booking._id); setDetailsModal({show:false, booking:null, conflicts:[], series:[]}); }} className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition-colors">Approve Slot</button>
                  <button onClick={() => { handleReject(detailsModal.booking._id); setDetailsModal({show:false, booking:null, conflicts:[], series:[]}); }} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold transition-colors">Reject Request</button>
                </>
              )}
              <button onClick={() => setDetailsModal({ show: false, booking: null, conflicts: [], series: [] })} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal (Story 8) */}
      {editModal.show && editModal.booking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6">Modify Proposal</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Date</label>
                <input 
                  type="date" 
                  className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                  value={editModal.booking.date?.split('T')[0] || ''}
                  onChange={(e) => setEditModal(p => ({ ...p, booking: { ...p.booking, date: e.target.value }}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Start Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                    value={editModal.booking.startTime}
                    onChange={(e) => setEditModal(p => ({ ...p, booking: { ...p.booking, startTime: e.target.value }}))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">End Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                    value={editModal.booking.endTime}
                    onChange={(e) => setEditModal(p => ({ ...p, booking: { ...p.booking, endTime: e.target.value }}))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Purpose</label>
                <textarea 
                  className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-blue-500 outline-none h-24"
                  value={editModal.booking.purpose}
                  onChange={(e) => setEditModal(p => ({ ...p, booking: { ...p.booking, purpose: e.target.value }}))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitAdminEdit}
                disabled={loading[editModal.booking._id]}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading[editModal.booking._id] ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditModal({ show: false, booking: null })}
                className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default BookingList;
