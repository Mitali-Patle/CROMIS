"use client";

import React from "react";
import {
  Calendar,
  BarChart3,
  Users,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const CromisHomepage = () => {
  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden mt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-black pointer-events-none" />

        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto flex flex-col items-center justify-center">
          <h1 className="text-[5rem] md:text-[18rem] font-bold mb-6 tracking-wider leading-none">
            CROMIS
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 mb-4 tracking-wide font-light">
            Campus Reservation & Optimization Management Intelligence System
          </p>

          <p className="text-base text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Transform your campus operations with AI-powered scheduling,
            real-time analytics, and seamless resource management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-transparent border border-gray-700 rounded-full font-medium hover:bg-gray-900 transition-all">
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: "500+", label: "Institutions" },
            { num: "99.9%", label: "Uptime" },
            { num: "2M+", label: "Reservations" },
            { num: "40%", label: "Time Saved" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 border border-gray-900 rounded-lg hover:border-gray-700 transition-colors"
            >
              <div className="text-4xl font-bold mb-2">{stat.num}</div>
              <div className="text-gray-500 text-sm tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">Powerful Features</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Everything you need to manage campus resources efficiently and
              intelligently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((feature, i) => (
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

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Transform Your Campus?
          </h2>
          <p className="text-gray-500 text-lg mb-12">
            Join hundreds of institutions already using CROMIS to streamline
            their operations.
          </p>
          <button className="group px-10 py-5 bg-white text-black rounded-full font-medium text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mx-auto">
            Get Started Today
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CromisHomepage;
