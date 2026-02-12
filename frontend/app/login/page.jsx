"use client";

import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { gsap } from "gsap";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await apiRequest("/auth/login", "POST", {
      email: formData.email,
      password: formData.password,
    });

    // Save token and role to cookies AND localStorage
    document.cookie = `token=${res.token}; path=/; max-age=604800`;
    document.cookie = `role=${res.user.role}; path=/; max-age=604800`;

    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.user.role);

    // Redirect based on role from backend
    if (res.user.role === "admin") {
      window.location.href = "/admin";
    } else if (res.user.role === "faculty") {
      window.location.href = "/faculty";  // ← NEW: Faculty redirect
    } else if (res.user.role === "student") {
      window.location.href = "/student";
    } else {
      window.location.href = "/";  // Fallback
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

        <div className="w-full lg:w-1/2 flex items-center justify-center py-20 px-6 relative">
          <div className="relative z-20 w-full max-w-md mx-auto px-6">
            <h1 className="text-4xl font-bold text-center mb-8">Login</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="your@email.com"
                />
              </div>

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
                    placeholder="Enter password"
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

              <button
                type="submit"
                disabled={loading}
                className="group w-full px-8 py-4 bg-white text-black rounded-full font-medium flex items-center justify-center gap-2"
              >
                {loading ? "Logging in..." : "Login"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="text-center mt-6 text-gray-500 text-sm">
              Don't have an account?{" "}
              <a href="/signup" className="text-white hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </section>

      <div className="absolute top-8 left-8 z-30">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition border border-gray-600 rounded-lg px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>
      </div>
    </div>
  );
}
