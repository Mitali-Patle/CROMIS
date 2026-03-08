import { useRouter } from "next/navigation";

export default function DraftResumeButton({ draft }) {
  const router = useRouter();

  const resume = () => {
    localStorage.setItem("resumeDraft", JSON.stringify(draft));
    router.push("/student");
  };

  return (
<<<<<<< HEAD
    <button onClick={resume} className="px-3 py-1 bg-blue-600 rounded text-sm">
=======
    <button
      onClick={resume}
      className="px-3 py-1 bg-blue-600 rounded text-sm"
    >
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
      Resume
    </button>
  );
}
