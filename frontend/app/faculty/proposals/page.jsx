"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import ProposalList from "../components/ProposalList";

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/bookings/my")
      .then(setProposals)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading proposals...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Proposals</h1>

      {proposals.length === 0 ? (
        <p className="text-gray-500">
          You haven’t submitted any proposals yet.
        </p>
      ) : (
        <ProposalList proposals={proposals} />
      )}
    </div>
  );
}
