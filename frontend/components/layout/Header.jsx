"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = useMemo(
    () => [
      { name: "Features", href: "#features" },
      { name: "About", href: "#about" },
      { name: "Login", href: "/login" },
    ],
    [],
  );
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
                {/* Simple Get Started Button - Desktop */}
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-black bg-white hover:bg-gray-100 transition-colors duration-200"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
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
                {/* Simple Get Started Button - Mobile */}
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-colors duration-200"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
