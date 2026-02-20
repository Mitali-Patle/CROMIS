"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function FacultyProposalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/bookings/${id}`)
      .then(setProposal)
      .catch((err) => {
        alert(err.message || "Failed to load proposal");
        router.push("/faculty");
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white hover:underline text-sm flex items-center gap-1 transition-colors"
        >
          ← Back to My Proposals
        </button>

        <div className="border border-gray-700 bg-black rounded-lg p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{proposal.resource?.name}</h1>
              <p className="text-xs text-gray-500 mt-1">
                ID: {proposal._id?.slice(-6).toUpperCase()}
              </p>
            </div>
            <span
              className={`font-semibold px-3 py-1 rounded-full text-sm bg-gray-800 ${statusColors[proposal.status]}`}
            >
              {proposal.status.toUpperCase()}
            </span>
          </div>

          <p className="text-gray-400">
            {proposal.date?.split("T")[0]} | {proposal.startTime} –{" "}
            {proposal.endTime}
          </p>

          <div>
            <h3 className="font-semibold mb-1 text-gray-300">Purpose</h3>
            <p className="text-sm text-gray-200">{proposal.purpose}</p>
          </div>

          {proposal.adminComment && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded p-3">
              <h3 className="font-semibold mb-1 text-indigo-300 text-sm">
                Admin Comment
              </h3>
              <p className="text-sm text-gray-200">{proposal.adminComment}</p>
            </div>
          )}

          {proposal.rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
              <h3 className="font-semibold mb-1 text-red-400 text-sm">
                Rejection Reason
              </h3>
              <p className="text-sm text-gray-200">
                {proposal.rejectionReason}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Created: {new Date(proposal.createdAt).toLocaleString()}
            <br />
            Last updated: {new Date(proposal.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
