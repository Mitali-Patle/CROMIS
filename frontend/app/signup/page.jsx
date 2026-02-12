"use client";

import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { gsap } from "gsap";
import {
  ArrowRight,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        rotation: -360,
        duration: 20,
        ease: "none",
        repeat: -1,
        transformOrigin: "center center",
      });
    }
  }, []);

  // Handle input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle signup submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest("/auth/signup", "POST", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "student", // Default signup role (students only)
      });

      // Save token and role (use response data, not hardcoded)
      document.cookie = `token=${res.token}; path=/; max-age=604800`;
      document.cookie = `role=${res.user.role}; path=/; max-age=604800`;

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user.role);

      alert("Signup successful!");

      // Redirect based on actual role from backend response
      if (res.user.role === "faculty") {
        window.location.href = "/faculty";
      } else if (res.user.role === "student") {
        window.location.href = "/student";
      } else if (res.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img
            ref={imageRef}
            src="/cromis-auth.png"
            alt="Auth background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center py-20 px-6 lg:bg-transparent relative">
          <div className="relative z-20 w-full max-w-md mx-auto px-6 lg:bg-transparent">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-center mb-8">Sign Up</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 bg-transparent border border-gray-700 rounded-lg"
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 bg-transparent border border-gray-700 rounded-lg"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full px-8 py-4 bg-white text-black rounded-full font-medium flex items-center justify-center gap-2"
              >
                {loading ? "Creating..." : "Create Account"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform mt-[1px]" />
              </button>
            </form>

            {/* Already have account */}
            <p className="text-center mt-6 text-gray-500 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-white hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </section>

      <div className="absolute top-8 left-8 z-30">
        <a
          href="/"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition font-medium border border-gray-600 rounded-lg px-2 py-2"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mt-[-2px]" /> Back to Home
        </a>
      </div>
    </div>
  );
}
