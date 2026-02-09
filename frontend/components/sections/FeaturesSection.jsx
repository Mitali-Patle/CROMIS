import React from "react";
import { Calendar, BarChart3, Users, Lock, Zap, Eye } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Structured Resource Booking",
      desc: "Seamless reservations for seminar halls, labs, sports facilities, and specialized equipment with intuitive interface.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Utilization Analytics",
      desc: "Data-driven insights into resource occupancy, usage patterns, and efficiency metrics to inform institutional decisions.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI Demand Forecasting",
      desc: "Predictive optimization to allocate resources equitably, prevent monopolization, and maximize availability.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Equitable Access Controls",
      desc: "Role-based permissions and fair usage policies promoting transparency and preventing overbooking.",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Approval Workflows",
      desc: "Automated conflict detection, real-time notifications, and streamlined approval processes for secure bookings.",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Real-Time Occupancy Visibility",
      desc: "Live monitoring of resource status with sustainable practices to reduce waste and enhance operational fairness.",
    },
  ];

  return (
    <section id="features" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Core Features</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Optimizing campus resource management with AI insights, equitable
            access, and sustainable efficiency
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-8 bg-gradient-to-b from-gray-900/50 to-black border border-gray-800 rounded-2xl hover:border-gray-600 transition-all hover:transform hover:-translate-y-2 duration-300"
            >
              <div className="mb-6 text-gray-400 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
