import React from "react";

const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">About CROMIS</h2>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto">
            CROMIS is a revolutionary platform designed to streamline campus
            operations for educational institutions worldwide. Founded on
            cutting-edge AI and data analytics, we empower administrators,
            faculty, and students with intuitive tools for efficient resource
            management.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white">Our Mission</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              To eliminate scheduling conflicts and optimize space utilization,
              saving time and reducing costs for universities and colleges. With
              CROMIS, every reservation is intelligent, every insight
              actionable.
            </p>
            <ul className="space-y-4 text-gray-500">
              <li className="flex items-center gap-3">
                • Innovative AI algorithms for predictive booking
              </li>
              <li className="flex items-center gap-3">
                • Scalable solutions for campuses of all sizes
              </li>
              <li className="flex items-center gap-3">
                • 24/7 support and continuous updates
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
