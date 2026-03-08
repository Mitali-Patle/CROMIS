"use client";

<<<<<<< HEAD
import { Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black">
      {/* Burger Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Student Dashboard</h1>
=======
import { useEffect, useState } from "react";

export default function Header() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const match = document.cookie.match(/role=([^;]+)/);
    if (match) setRole(match[1]);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-bold">
          C
        </div>
        <h1 className="text-lg font-semibold">
          {role === "faculty" ? "Faculty Dashboard" : "Student / Faculty Dashboard"}
        </h1>
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
      </div>
    </header>
  );
}
