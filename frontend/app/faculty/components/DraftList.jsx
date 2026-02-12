import DraftCard from "./DraftCard";

export default function DraftList({ drafts }) {
  return (
    <div className="space-y-4">
      {drafts.map((d) => (
        <DraftCard key={d._id} draft={d} />
      ))}
    </div>
  );
}
