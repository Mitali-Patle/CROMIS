"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Loader2 } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ResourceForm from "./components/ResourceForm";
import BookingList from "./components/BookingList";
import AnalyticsChart from "./components/AnalyticsChart";
import TensorFlowInsights from "./components/TensorFlowInsights";
import ReportExporter from "./components/ReportExporter";
import Dashboard from "./components/Dashboard";
import { apiRequest } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();

  /* =======================
     STATE
  ======================= */
  const [role, setRole] = useState(null); // 🔑 KEY FIX
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [summaryData, setSummaryData] = useState({
    totalResources: 0,
    pendingProposals: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    currentOccupancy: "0%",
  });

  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    daily: [],
    weekly: [],
    peakHours: [],
    underutilized: [],
    roleUsage: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =======================
     🔐 ROLE GUARD (RUNS FIRST)
  ======================= */
  useEffect(() => {
    const r = localStorage.getItem("role");

    if (r !== "admin") {
      router.replace("/login"); // or "/login"
      return;
    }

    setRole(r); // ONLY admin reaches here
  }, [router]);

  /* =======================
     Persist active tab
  ======================= */
  useEffect(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  /* =======================
     DATA FETCHERS (ADMIN ONLY)
  ======================= */
  const fetchSummaryData = async () => {
    const [resourcesRes, bookingsRes] = await Promise.all([
      apiRequest("/resources"),
      apiRequest("/bookings"), // 🔒 admin only
    ]);

    const pending = bookingsRes.filter((b) => b.status === "pending");
    const approved = bookingsRes.filter((b) => b.status === "approved");
    const rejected = bookingsRes.filter((b) => b.status === "rejected");

    setSummaryData({
      totalResources: resourcesRes.length,
      pendingProposals: pending.length,
      approvedRequests: approved.length,
      rejectedRequests: rejected.length,
      currentOccupancy: `${Math.round(
        (approved.length / (resourcesRes.length * 10)) * 100,
      )}%`,
    });

    setPendingBookings(pending);
    setBookings(bookingsRes);
  };

  const fetchAnalytics = async () => {
    const [daily, weekly, peakHours, underutilized, roleUsage] =
      await Promise.all([
        apiRequest("/analytics/daily"),
        apiRequest("/analytics/weekly"),
        apiRequest("/analytics/peak-hours"),
        apiRequest("/analytics/underutilized"),
        apiRequest("/analytics/role-usage"),
      ]);

    setAnalyticsData({ daily, weekly, peakHours, underutilized, roleUsage });
  };

  /* =======================
     🚀 LOAD DATA (ONLY AFTER ROLE CONFIRMED)
  ======================= */
  useEffect(() => {
    if (role !== "admin") return; // 🛑 HARD STOP

    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchSummaryData(), fetchAnalytics()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [role]);

  /* =======================
     APPROVE / REJECT
  ======================= */
  const handleApprove = async (id) => {
    await apiRequest(`/bookings/${id}`, "PATCH", { status: "approved" });
    fetchSummaryData();
  };

  const handleReject = async (id) => {
    await apiRequest(`/bookings/${id}`, "PATCH", { status: "rejected" });
    fetchSummaryData();
  };

  /* =======================
     RENDER TABS
  ======================= */
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            summaryData={summaryData}
            pendingBookings={pendingBookings}
          />
        );
      case "resources":
        return <ResourceForm />;
      case "bookings":
        return (
          <BookingList
            bookings={bookings}
            mode="history"
            onRefresh={fetchSummaryData}
          />
        );
      case "approvals":
        return (
          <BookingList
            bookings={pendingBookings}
            mode="approval"
            onApprove={handleApprove}
            onReject={handleReject}
            onRefresh={fetchSummaryData}
          />
        );
      case "approved-singles":
        const approvedSingles = bookings.filter(
          (b) => b.status === "approved" && !b.groupId,
        );
        return (
          <BookingList
            bookings={approvedSingles}
            mode="history"
            onRefresh={fetchSummaryData}
          />
        );
      case "analytics":
        return (
          <AnalyticsChart
            data={analyticsData.daily.map((d) => d.totalBookings)}
            title="Daily Utilization"
          />
        );
      case "reports":
        return (
          <ReportExporter
            analyticsData={analyticsData}
            bookings={bookings}
            pendingBookings={pendingBookings}
          />
        );
      default:
        return null;
    }
  };

  /* =======================
     LOADING / ERROR
  ======================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-500">
        Error: {error}
      </div>
    );
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="bg-black text-white min-h-screen flex">
      <Sidebar
        activeTab={activeTab}
        onNavClick={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-800 p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-2"
          >
            <Menu />
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}
