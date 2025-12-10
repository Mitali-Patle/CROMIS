"use client";

import React, { useState } from "react";
import { ArrowRight, Mail, User, Lock } from "lucide-react";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup submitted:", formData);
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* Signup Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
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

        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider leading-none">
              Sign Up
            </h1>
            <p className="text-xl text-gray-400 tracking-wide font-light">
              Create your CROMIS account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className="group w-full px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-white hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignupPage;
