"use client";

import { Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Faculty Dashboard</h1>
      </div>
    </header>
  );
}
