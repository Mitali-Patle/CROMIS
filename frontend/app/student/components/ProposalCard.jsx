"use client";

import Link from "next/link";

export default function ProposalCard({ proposal, onCancel }) {
  const statusColors = {
    pending: "text-yellow-400",
    approved: "text-green-400",
    rejected: "text-red-400",
    cancelled: "text-gray-400",
    expired: "text-gray-500",
  };

  return (
    <div className="border border-gray-700 rounded p-4 bg-gray-900 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">
            {proposal.resource?.name || "Unknown Resource"}
          </h3>
          <p className="text-xs text-gray-500">
            ID: {proposal._id.slice(-6).toUpperCase()}
          </p>
        </div>

        <span
          className={`text-sm font-semibold ${statusColors[proposal.status]}`}
        >
          {proposal.status.toUpperCase()}
        </span>
      </div>

      {/* Date & Time */}
      <p className="text-sm text-gray-400">
        {proposal.date?.split("T")[0]} | {proposal.startTime} –{" "}
        {proposal.endTime}
      </p>

      {/* Purpose */}
      <p className="text-sm">{proposal.purpose}</p>

      {/* Timeline */}
      <p className="text-xs text-gray-500">
        Submitted: {new Date(proposal.createdAt).toLocaleString()}
      </p>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        {/* View Details — Story 8 */}
        <Link
          href={`/student/proposals/${proposal._id}`}
          className="text-blue-400 text-sm hover:underline"
        >
          View Details
        </Link>

        {/* Edit — Story 13 (pending only, hook) */}
        {proposal.status === "pending" && (
  <button
  onClick={() => {
    localStorage.setItem(
      "resumeEditBooking",
      JSON.stringify(proposal)
    );
    sessionStorage.setItem("openTab", "new");
    window.location.href = "/student";
  }}
  className="text-yellow-400 text-sm hover:underline"
>
  Edit
</button>

)}


        {/* Cancel — Story 6 */}
        {proposal.status === "pending" && (
          <button
            onClick={() => onCancel(proposal._id)}
            className="text-red-400 text-sm hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
