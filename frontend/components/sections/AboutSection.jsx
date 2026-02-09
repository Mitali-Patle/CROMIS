import React from "react";

const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">About CROMIS</h2>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto">
            CROMIS is an advanced Campus Resource Reservation and Utilization
            Optimization System designed to transform institutional facility
            management. By leveraging AI-driven forecasting and analytics, it
            enables structured bookings for seminar halls, labs, sports
            facilities, and equipment while ensuring equitable access and
            operational efficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white">Our Mission</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              To address real institutional challenges in resource allocation by
              preventing monopolization, detecting conflicts, and providing
              real-time visibility into occupancy. Guided by sustainable and
              ethical principles, CROMIS promotes fair usage, minimizes waste of
              underutilized spaces, and fosters transparent policies for
              improved efficiency and equity.
            </p>
            <ul className="space-y-4 text-gray-500">
              <li className="flex items-center gap-3">
                • AI-based demand forecasting to optimize allocations and
                prevent overbooking
              </li>
              <li className="flex items-center gap-3">
                • Analytics-driven insights for monitoring utilization and
                identifying inefficiencies
              </li>
              <li className="flex items-center gap-3">
                • Automated workflows for approvals, conflict resolution, and
                equitable access
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
