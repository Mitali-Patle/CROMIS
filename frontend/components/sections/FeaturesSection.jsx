import React from "react";
import { Calendar, BarChart3, Users, Lock, Zap } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      desc: "AI-powered reservation system that optimizes room and resource allocation automatically.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      desc: "Comprehensive insights into campus utilization with interactive dashboards and reports.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "User Management",
      desc: "Role-based access control with seamless integration for students, faculty, and staff.",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Secure & Compliant",
      desc: "Enterprise-grade security with full GDPR compliance and data encryption.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      desc: "Optimized performance ensuring instant booking confirmations and updates.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Mobile Ready",
      desc: "Fully responsive design with native mobile apps for iOS and Android.",
    },
  ];

  return (
    <section id="features" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Everything you need to manage campus resources efficiently and
            intelligently
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
