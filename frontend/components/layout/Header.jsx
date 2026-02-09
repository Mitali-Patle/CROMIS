"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Toast from "../ui/Toast";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const token = getCookie("token");
    const userRole = getCookie("role");

    if (token) {
      setIsLoggedIn(true);
      setRole(userRole || "");
    }
  }, []);

  const showToastMessage = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const performLogout = () => {
    setShowConfirm(false);
    // Clear cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Show toast
    showToastMessage("Logged out successfully", "success");
    // Redirect after toast delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const navLinks = useMemo(() => {
    if (isLoggedIn && role) {
      return [
        { name: "Features", href: "#features" },
        { name: "About", href: "#about" },
        { name: "Dashboard", href: `/${role}` },
      ];
    }
    return [
      { name: "Features", href: "#features" },
      { name: "About", href: "#about" },
      { name: "Login", href: "/login" },
    ];
  }, [isLoggedIn, role]);

  const actionButton = useMemo(() => {
    if (isLoggedIn) {
      return (
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-white bg-transparent hover:bg-white/10 transition-colors duration-200"
        >
          Logout
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      );
    }
    return (
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-black bg-white hover:bg-gray-100 transition-colors duration-200"
      >
        Get Started
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    );
  }, [isLoggedIn]);

  const mobileActionButton = useMemo(() => {
    if (isLoggedIn) {
      return (
        <button
          onClick={() => {
            handleLogout();
            setMobileOpen(false);
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-transparent hover:bg-white/10 transition-colors duration-200"
        >
          Logout
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      );
    }
    return (
      <Link
        href="/signup"
        onClick={() => setMobileOpen(false)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-colors duration-200"
      >
        Get Started
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    );
  }, [isLoggedIn]);

  return (
    <>
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl md:max-w-7xl">
        <div
          className={`backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/20 transition-all duration-300 ${
            mobileOpen ? "bg-black opacity-100" : "bg-black/40"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link
                href="#home"
                className="flex items-center gap-3 text-[13px] sm:text-sm font-medium text-zinc-300"
              >
                <img
                  src="/cromis-logo.png"
                  alt="CROMIS Logo"
                  className="h-8 w-8 hover:shadow-lg hover:shadow-black/30 transition-shadow duration-300"
                />
                <span className="tracking-wide hover:text-white transition-colors ease-in duration-150">
                  CROMIS
                </span>
              </Link>
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-zinc-300 hover:text-white transition-colors duration-300 relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  </Link>
                ))}
                {/* Action Button - Desktop */}
                {actionButton}
              </nav>
              {/* Mobile Menu Button */}
              <button
                className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                onClick={() => setMobileOpen((s) => !s)}
                aria-label="Toggle navigation"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile Dropdown */}
          {mobileOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-2 backdrop-blur-xl bg-black border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden transition-all duration-500 ease-in-out opacity-100">
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm text-zinc-200 hover:bg-white/10 hover:text-white transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Action Button - Mobile */}
                {mobileActionButton}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-lg font-medium mb-4">
                Are you sure you want to logout?
              </h3>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={performLogout}
                  className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
