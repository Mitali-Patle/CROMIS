import ProposalCard from "./ProposalCard";

export default function ProposalList({ proposals }) {
  return (
    <div className="space-y-4">
      {proposals.map((p) => (
        <ProposalCard key={p._id} proposal={p} />
      ))}
    </div>
  );
}
