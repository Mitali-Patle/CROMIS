"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import ProposalForm from "../../../components/ProposalForm";

export default function EditProposalPage() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProposal = async () => {
      try {
        const data = await apiRequest(`/bookings/${id}`);

        if (data.status !== "pending") {
          alert("Only pending proposals can be edited");
          router.push("/student");
          return;
        }

        setProposal(data);
      } catch (err) {
        alert(err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadProposal();
  }, [id, router]);

  if (loading) {
    return <p className="p-6 text-gray-400">Loading proposal...</p>;
  }

  if (!proposal) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Proposal</h1>

      <ProposalForm
        editMode
        proposalId={id}
        initialData={{
          resource: proposal.resource?._id,
          date: proposal.date?.split("T")[0],
          startTime: proposal.startTime,
          endTime: proposal.endTime,
          purpose: proposal.purpose,
        }}
        onSuccess={() => router.push("/student")}
      />
    </div>
  );
}
