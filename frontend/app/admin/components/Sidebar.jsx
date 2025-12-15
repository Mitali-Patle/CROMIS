"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  LayoutDashboard,
  Settings,
  Calendar,
  CheckCircle,
  BarChart3,
  FileText,
} from "lucide-react";

const Sidebar = ({ onNavClick, activeTab, isOpen, onToggle }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "resources", label: "Resources", icon: Settings },
    { key: "bookings", label: "Bookings", icon: Calendar },
    { key: "approvals", label: "Approvals", icon: CheckCircle },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "reports", label: "Reports", icon: FileText },
  ];

  const handleNavClick = (key) => {
    onNavClick(key);
    // Auto-collapse/minimize after selection on both mobile (close) and laptop/desktop (collapse)
    onToggle(false);
  };

  if (isMobile && !isOpen) {
    // Hidden on mobile when closed
    return null;
  }

  const isCollapsed = !isOpen;
  const sidebarClasses = isMobile
    ? `fixed inset-0 z-50 bg-black text-white transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : `bg-black text-white h-screen transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`;

  return (
    <>
      {isMobile && isOpen && (
        // Overlay backdrop for mobile
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => onToggle(false)}
        />
      )}
      <div className={sidebarClasses}>
        <div className="p-4 flex justify-between items-center border-b border-gray-800 flex-shrink-0">
          <div
            className={`${isCollapsed ? "hidden" : "flex items-center gap-2"}`}
          >
            <img
              src="/cromis-logo.png" // Replace with your logo path (e.g., in public folder)
              alt="CROMIS Logo"
              className="w-7 h-7 flex-shrink-0" // Adjust size as needed
            />
            <h1 className="text-xl text-white">CROMIS</h1>
          </div>
          <button
            onClick={() => onToggle(!isOpen)}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isMobile ? (
              <X className="w-5 h-5" />
            ) : isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        <nav className="flex-1 mt-4 space-y-2 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  } ${isCollapsed ? "mr-0" : "mr-3"}`}
                />
                <span
                  className={`transition-opacity duration-200 whitespace-nowrap ${
                    isCollapsed ? "hidden opacity-0" : "block opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
