"use client";

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
      </div>
    </header>
  );
}
