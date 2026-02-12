import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProposalActions({ proposal }) {
  const router = useRouter();

  if (proposal.status !== "pending") {
    return null;
  }

  const cancelProposal = async () => {
    if (!confirm("Cancel this proposal?")) return;
    await apiRequest(`/bookings/${proposal._id}`, "DELETE");
    router.push("/student/proposals");
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={cancelProposal}
        className="px-4 py-2 bg-red-600 rounded text-white"
      >
        Cancel Proposal
      </button>
    </div>
  );
}
