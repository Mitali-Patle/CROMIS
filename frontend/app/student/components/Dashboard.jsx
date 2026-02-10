"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    drafts: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const bookings = await apiRequest("/bookings/my");
        const drafts = await apiRequest("/drafts");

        setStats({
          total: bookings.length,
          pending: bookings.filter(b => b.status === "pending").length,
          approved: bookings.filter(b => b.status === "approved").length,
          drafts: drafts.length,
        });
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid grid-cols-2 gap-4">
        <Stat title="Total Proposals" value={stats.total} />
        <Stat title="Pending" value={stats.pending} />
        <Stat title="Approved" value={stats.approved} />
        <Stat title="Drafts" value={stats.drafts} />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={() => onNavigate("new")}
          className="bg-white text-black px-6 py-3 rounded font-semibold"
        >
          New Proposal
        </button>
        <button
          onClick={() => onNavigate("my")}
          className="bg-gray-700 px-6 py-3 rounded"
        >
          My Proposals
        </button>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
