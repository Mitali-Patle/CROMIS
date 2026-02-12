import DraftResumeButton from "./DraftResumeButton";
import { apiRequest } from "@/lib/api";

export default function DraftCard({ draft }) {
  const deleteDraft = async () => {
    if (!confirm("Delete this draft?")) return;
    await apiRequest(`/drafts/${draft._id}`, "DELETE");
    window.location.reload();
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4 flex justify-between">
      <div>
        <p className="font-medium">
          {draft.resource?.name || "Draft Proposal"}
        </p>
        <p className="text-sm text-gray-400">
          Last updated: {new Date(draft.updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-3">
        <DraftResumeButton draft={draft} />
        <button
          onClick={deleteDraft}
          className="px-3 py-1 bg-red-600 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
