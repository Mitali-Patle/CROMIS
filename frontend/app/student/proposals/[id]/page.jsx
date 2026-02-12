"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function ProposalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/bookings/${id}`)
      .then(setProposal)
      .catch((err) => {
        alert(err.message || "Failed to load proposal");
        router.push("/student");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-gray-400 p-6">Loading proposal…</p>;
  }

  if (!proposal) return null;

  const statusColors = {
    pending: "text-yellow-400",
    approved: "text-green-400",
    rejected: "text-red-400",
    cancelled: "text-gray-400",
    expired: "text-gray-500",
  };

  return (
    <div className="max-w-3xl p-6 space-y-6 text-white">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:underline text-sm"
      >
        ← Back
      </button>

      <div className="border border-gray-700 bg-black rounded p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{proposal.resource?.name}</h1>
          <span className={`font-semibold ${statusColors[proposal.status]}`}>
            {proposal.status.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-400">
          {proposal.date?.split("T")[0]} | {proposal.startTime} –{" "}
          {proposal.endTime}
        </p>

        <div>
          <h3 className="font-semibold mb-1">Purpose</h3>
          <p className="text-sm">{proposal.purpose}</p>
        </div>

        {proposal.adminComment && (
          <div>
            <h3 className="font-semibold mb-1">Admin Comment</h3>
            <p className="text-sm text-gray-300">{proposal.adminComment}</p>
          </div>
        )}

        {proposal.rejectionReason && (
          <div>
            <h3 className="font-semibold mb-1 text-red-400">
              Rejection Reason
            </h3>
            <p className="text-sm">{proposal.rejectionReason}</p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Created: {new Date(proposal.createdAt).toLocaleString()}
          <br />
          Last updated: {new Date(proposal.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
