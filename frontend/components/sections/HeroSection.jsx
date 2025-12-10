"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

// Dynamic import for LiquidEther to avoid SSR issues
const LiquidEther = dynamic(() => import("@/components/ui/LiquidEther"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-black" />
  ),
});

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* LiquidEther Background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={["#ffffffff", "#ffffffff", "#ffffffff"]}
          autoDemo={true}
          resolution={0.5}
          mouseForce={20}
          autoIntensity={2.2}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-black pointer-events-none z-5" />

      {/* Animated grid background (optional overlay for texture) */}
      <div className="absolute inset-0 opacity-20 z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-20 text-center px-6 max-w-6xl mx-auto flex flex-col items-center justify-center mt-12">
        <h1 className="text-[5rem] md:text-[18rem] font-bold mb-6 tracking-wider leading-none">
          CROMIS
        </h1>

        <p className="text-lg md:text-2xl text-gray-400 mb-4 tracking-wide font-light">
          Campus Reservation & Optimization Management Intelligence System
        </p>

        <p className="text-base text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Transform your campus operations with AI-powered scheduling, real-time
          analytics, and seamless resource management.
        </p>

        <div className="flex flex-row gap-3 justify-center">
          <Link href="/signup">
            <button className="group px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
              Get Started
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-3 md:px-8 md:py-4 bg-transparent border border-gray-700 rounded-full font-medium hover:bg-gray-900 transition-all text-sm md:text-base">
              Login
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
