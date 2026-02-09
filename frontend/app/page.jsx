"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import AboutSection from "@/components/sections/AboutSection";
import CTASection from "@/components/sections/CTASection";

const CromisHomepage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash === "#about") {
          const element = document.getElementById("about");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }
      };

      // Initial check
      handleHashChange();

      // Listen for hash changes
      window.addEventListener("hashchange", handleHashChange);

      // Cleanup
      return () => {
        window.removeEventListener("hashchange", handleHashChange);
      };
    }
  }, [router]);

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default CromisHomepage;
