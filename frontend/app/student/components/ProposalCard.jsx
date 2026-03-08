"use client";

import Link from "next/link";

export default function ProposalCard({ proposal, onCancel }) {
  const statusColors = {
<<<<<<< HEAD
    pending: "text-gray-300",
    approved: "text-white font-bold",
    rejected: "text-gray-400",
    cancelled: "text-gray-500",
    expired: "text-gray-600",
  };

  return (
    <div className="border border-gray-700 rounded p-4 bg-black space-y-3">
=======
    pending: "text-yellow-400",
    approved: "text-green-400",
    rejected: "text-red-400",
    cancelled: "text-gray-400",
    expired: "text-gray-500",
  };

  return (
    <div className="border border-gray-700 rounded p-4 bg-gray-900 space-y-3">
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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

<<<<<<< HEAD
      {/* Admin Comment */}
      {proposal.adminComment && (
        <div className="bg-gray-900 border border-gray-600 rounded p-3">
          <p className="text-xs font-semibold text-gray-300 mb-1">
            Admin Comment:
          </p>
          <p className="text-sm text-gray-200">{proposal.adminComment}</p>
        </div>
      )}

=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
      {/* Timeline */}
      <p className="text-xs text-gray-500">
        Submitted: {new Date(proposal.createdAt).toLocaleString()}
      </p>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
<<<<<<< HEAD
        <Link
          href={`/student/proposals/${proposal._id}`}
          className="text-white text-sm hover:underline"
=======
        {/* View Details — Story 8 */}
        <Link
          href={`/student/proposals/${proposal._id}`}
          className="text-blue-400 text-sm hover:underline"
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
        >
          View Details
        </Link>

<<<<<<< HEAD
        {proposal.status === "pending" && (
          <button
            onClick={() => {
              localStorage.setItem(
                "resumeEditBooking",
                JSON.stringify(proposal),
              );
              sessionStorage.setItem("openTab", "new");
              window.location.href = "/student";
            }}
            className="text-gray-300 text-sm hover:underline"
          >
            Edit
          </button>
        )}

        {proposal.status === "pending" && (
          <button
            onClick={() => onCancel(proposal._id)}
            className="text-gray-500 text-sm hover:text-white hover:underline"
=======
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
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
