"use client";

import { useRouter } from "next/navigation";

export default function Sidebar({ activeTab, onNavClick }) {
  const router = useRouter();

  const items = [
    { id: "home", label: "Home" },
    { id: "new", label: "New Proposal" },
    { id: "my", label: "My Proposals" },
    { id: "drafts", label: "Drafts" },
  ];

  const logout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    document.cookie = "role=; Max-Age=0; path=/;";
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-black border-r border-gray-800 p-4 flex flex-col justify-between">
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavClick(item.id)}
            className={`w-full text-left px-4 py-3 rounded transition
              ${
                activeTab === item.id
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="mt-6 px-4 py-3 text-left rounded text-red-400 hover:bg-gray-800"
      >
        Logout
      </button>
    </aside>
  );
}
