import React from "react";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Make Reservations Easy – Book Your Space in Minutes
        </h2>
        <p className="text-gray-500 text-lg mb-12">
          Reservations will go through a quick approval process to ensure fair
          and efficient space allocation.
        </p>
        <button className="group px-6 py-3 md:px-10 md:py-5 bg-white text-black rounded-full font-medium text-sm md:text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mx-auto">
          Get Started Today
          <ArrowRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default CTASection;
