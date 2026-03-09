"use client";
import { apiRequest } from "@/lib/api";
import { useState } from "react";

export default function StudentBookingList({ bookings }) {
  const [loading, setLoading] = useState({});

  const handleCancel = async (id) => {
    if (!confirm("Cancel this proposal?")) return;

    setLoading((p) => ({ ...p, [id]: true }));
    try {
      await apiRequest(`/bookings/${id}`, "DELETE");
      window.location.reload();
    } catch {
      alert("Cancel failed");
    }
    setLoading((p) => ({ ...p, [id]: false }));
  };

  return (
    <table className="w-full bg-black border border-gray-700 rounded-lg">
      <thead className="bg-gray-800">
        <tr>
          <th className="p-3">Resource</th>
          <th className="p-3">Date</th>
          <th className="p-3">Time</th>
          <th className="p-3">Status</th>
          <th className="p-3">Action</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b._id} className="border-t border-gray-700">
            <td className="p-3">{b.resource?.name}</td>
            <td className="p-3">{b.date}</td>
            <td className="p-3">
              {b.startTime} - {b.endTime}
            </td>
            <td className="p-3 capitalize">{b.status}</td>
            <td className="p-3">
              {b.status === "pending" && (
                <button
                  onClick={() => handleCancel(b._id)}
                  disabled={loading[b._id]}
                  className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {loading[b._id] ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
