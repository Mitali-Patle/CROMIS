import { useRouter } from "next/navigation";

export default function DraftResumeButton({ draft }) {
  const router = useRouter();

  const resume = () => {
    localStorage.setItem("resumeDraft", JSON.stringify(draft));
    router.push("/student");
  };

  return (
    <button
      onClick={resume}
      className="px-3 py-1 bg-blue-600 rounded text-sm"
    >
      Resume
    </button>
  );
}
