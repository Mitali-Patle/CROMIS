"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

// Dynamic import for LiquidEther to avoid SSR issues
const LiquidEther = dynamic(() => import("@/components/ui/LiquidEther"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-black" />
  ),
});

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login submitted:", formData);
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* Login Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        {/* Back to Home Button */}
        <div className="absolute top-8 left-8 z-30">
          <a
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mt-[-1px]" />
            Back to Home
          </a>
        </div>

        {/* LiquidEther Background */}
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={["#ffffffff", "#ffffffff", "#ffffffff"]} // Purple/pink theme to complement the dark UI
            autoDemo={true}
            resolution={0.5}
            mouseForce={20}
            autoIntensity={2.2}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-black pointer-events-none z-5" />

        {/* Animated grid background */}
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

        <div className="relative z-20 w-full max-w-md mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-wider leading-none">
              Welcome Back
            </h1>
            <p className="text-xl text-gray-400 tracking-wide font-light">
              Sign in to your CROMIS account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pr-12 px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group w-full px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <a href="/signup" className="text-white hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
