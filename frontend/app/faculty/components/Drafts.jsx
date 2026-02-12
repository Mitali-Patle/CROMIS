"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/drafts")
      .then(setDrafts)
      .catch((err) => {
        console.error(err);
        alert("Failed to load drafts");
      })
      .finally(() => setLoading(false));
  }, []);

  const resumeDraft = (draft) => {
    localStorage.setItem("resumeDraft", JSON.stringify(draft));
    sessionStorage.setItem("openTab", "new");
    window.location.href = "/student";
  };

  const deleteDraft = async (id) => {
    if (!confirm("Delete this draft?")) return;

    try {
      await apiRequest(`/drafts/${id}`, "DELETE");
      setDrafts((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert("Failed to delete draft");
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading drafts...</p>;
  }

  if (drafts.length === 0) {
    return <p className="text-gray-500">No drafts saved.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Drafts</h1>

      {drafts.map((draft) => (
        <div
          key={draft._id}
          className="border border-gray-700 bg-gray-900 rounded p-4 space-y-2"
        >
          <p className="text-sm text-gray-400">
            Resource: {draft.resource?.name || "Not selected"}
          </p>

          <p className="text-sm text-gray-400">
            Date:{" "}
            {draft.date
              ? new Date(draft.date).toLocaleDateString()
              : "Not selected"}
          </p>

          <p className="text-sm text-gray-300">
            Purpose: {draft.purpose || "—"}
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => resumeDraft(draft)}
              className="bg-white text-black px-4 py-2 rounded"
            >
              Resume
            </button>

            <button
              onClick={() => deleteDraft(draft._id)}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
