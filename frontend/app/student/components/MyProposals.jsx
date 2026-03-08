"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import ProposalCard from "./ProposalCard";

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadProposals = async () => {
    try {
      const data = await apiRequest("/bookings/my");
      setProposals(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const cancelProposal = async (id) => {
    if (!confirm("Cancel this proposal?")) return;

    try {
      await apiRequest(`/bookings/${id}`, "DELETE");
      loadProposals();
    } catch (err) {
      alert(err.message);
    }
  };

  // Unique resource list for filter dropdown
  const resources = useMemo(() => {
    const map = new Map();
    proposals.forEach((p) => {
      if (p.resource?._id) {
        map.set(p.resource._id, p.resource.name);
      }
    });
    return Array.from(map.entries());
  }, [proposals]);

  // Apply filters + search
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
<<<<<<< HEAD
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      const matchesResource =
        resourceFilter === "all" || p.resource?._id === resourceFilter;
=======
      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      const matchesResource =
        resourceFilter === "all" ||
        p.resource?._id === resourceFilter;
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

      const text = `${p.purpose} ${p.resource?.name}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      return matchesStatus && matchesResource && matchesSearch;
    });
  }, [proposals, statusFilter, resourceFilter, search]);

  if (loading) {
    return <p className="text-gray-400">Loading proposals...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Proposals</h1>

      {/* Filters */}
<<<<<<< HEAD
      <div className="flex flex-wrap gap-3 bg-black border border-gray-700 p-4 rounded">
=======
      <div className="flex flex-wrap gap-3 bg-gray-900 border border-gray-700 p-4 rounded">
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black border border-gray-700 p-2 rounded"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>

        {/* Resource */}
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="bg-black border border-gray-700 p-2 rounded"
        >
          <option value="all">All Resources</option>
          {resources.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search purpose or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] bg-black border border-gray-700 p-2 rounded"
        />
      </div>

      {/* List */}
      {filteredProposals.length === 0 ? (
        <p className="text-gray-400">No proposals match your filters.</p>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((p) => (
<<<<<<< HEAD
            <ProposalCard key={p._id} proposal={p} onCancel={cancelProposal} />
=======
            <ProposalCard
              key={p._id}
              proposal={p}
              onCancel={cancelProposal}
            />
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
          ))}
        </div>
      )}
    </div>
  );
}
