"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Home,
} from "lucide-react";

const Sidebar = ({ onNavClick, activeTab, isOpen, onToggle }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { key: "home", label: "Home", icon: Home },
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "resources", label: "Resources", icon: Settings },
    { key: "bookings", label: "Bookings", icon: Calendar },
    { key: "approvals", label: "Approvals", icon: CheckCircle },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "reports", label: "Reports", icon: FileText },
  ];

  const handleNavClick = (key) => {
    if (key === "home") {
      router.push("/");
      // Optionally close on mobile
      if (isMobile) {
        onToggle(false);
      }
    } else {
      onNavClick(key);
      // Auto-collapse/minimize after selection on mobile only (close)
      if (isMobile) {
        onToggle(false);
      }
    }
  };

  if (isMobile && !isOpen) {
    // Hidden on mobile when closed
    return null;
  }

  const isCollapsed = false; // Always open on desktop/laptop
  const sidebarClasses = isMobile
    ? `fixed inset-0 z-50 bg-black text-white transition-transform duration-300 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : `bg-black text-white h-screen transition-all duration-300 flex flex-col w-64`; // Always w-64 on desktop

  const showToggleButton = isMobile || false; // Only show toggle on mobile

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
          <div className="flex items-center gap-2">
            <img
              src="/cromis-logo.png" // Replace with your logo path (e.g., in public folder)
              alt="CROMIS Logo"
              className="w-7 h-7 flex-shrink-0" // Adjust size as needed
            />
            <h1 className="text-xl text-white">CROMIS</h1>
          </div>
          {showToggleButton && (
            <button
              onClick={() => onToggle(!isOpen)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                    ? "bg-white text-black shadow-lg"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive
                      ? "text-black"
                      : "text-gray-400 group-hover:text-white"
                  } mr-3`}
                />
                <span className="transition-opacity duration-200 whitespace-nowrap block opacity-100">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      {/* Mobile Navbar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-black text-white border-t border-gray-800 z-40 md:hidden">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`flex flex-col items-center px-2 py-1 rounded transition-all duration-200 ${
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1 ${isActive ? "text-white" : "text-gray-400"}`}
                  />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};

export default Sidebar;
