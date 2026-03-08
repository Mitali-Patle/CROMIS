"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import DraftList from "../components/DraftList";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/drafts")
      .then(setDrafts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading drafts...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Drafts</h1>

      {drafts.length === 0 ? (
        <p className="text-gray-500">No saved drafts.</p>
      ) : (
        <DraftList drafts={drafts} />
      )}
    </div>
  );
}
