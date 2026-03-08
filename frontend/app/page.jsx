"use client";

import React from "react";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import AboutSection from "@/components/sections/AboutSection";
import CTASection from "@/components/sections/CTASection";
import Header from "@/components/layout/Header";

export default function HomePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CTASection />
    </main>
  );
}
