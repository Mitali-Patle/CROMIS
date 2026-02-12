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
    heatmap: [],
    timeline: [],
    topResources: [],
    overallStatus: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =======================
     🔐 ROLE GUARD (RUNS FIRST)
  ======================= */
  useEffect(() => {
    const r = localStorage.getItem("role");

    if (r !== "admin") {
      router.replace("/login");
      return;
    }

    setRole(r);
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
      apiRequest("/bookings"),
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
    const endpoints = [
      { key: "daily", url: "/analytics/daily" },
      { key: "weekly", url: "/analytics/weekly" },
      { key: "peakHours", url: "/analytics/peak-hours" },
      { key: "underutilized", url: "/analytics/underutilized" },
      { key: "roleUsage", url: "/analytics/role-usage" },
      { key: "heatmap", url: "/analytics/heatmap" },
      { key: "timeline", url: "/analytics/timeline" },
      { key: "topResources", url: "/analytics/top-resources" },
      { key: "overallStatus", url: "/analytics/overall-status" },
    ];

    const results = await Promise.allSettled(
      endpoints.map((ep) => apiRequest(ep.url)),
    );

    const newData = {};
    endpoints.forEach((ep, i) => {
      newData[ep.key] =
        results[i].status === "fulfilled" ? results[i].value : [];
    });

    setAnalyticsData((prev) => ({ ...prev, ...newData }));
  };

  /* =======================
     🚀 LOAD DATA (ONLY AFTER ROLE CONFIRMED)
  ======================= */
  useEffect(() => {
    if (role !== "admin") return;

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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AnalyticsChart
                data={analyticsData.daily.map((d) => ({
                  name: d._id,
                  totalHours: Math.round(d.totalHours * 10) / 10,
                  bookingCount: d.bookingCount,
                }))}
                type="bar"
                title="Daily Utilization"
                subtitle="Hours booked vs total requests (last 7 days)"
              />
              <AnalyticsChart
                data={analyticsData.weekly.map((w) => ({
                  name: `W${w._id.week} ${w._id.year}`,
                  totalHours: Math.round(w.totalHours * 10) / 10,
                  bookingCount: w.bookingCount,
                }))}
                type="line"
                title="Weekly Trends"
                subtitle="Week-over-week resource demand"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AnalyticsChart
                data={["student", "faculty"].map((role) => {
                  const entry = analyticsData.roleUsage.find(
                    (r) => r.role === role,
                  );
                  return {
                    name: role.charAt(0).toUpperCase() + role.slice(1),
                    value: entry ? entry.count : 0,
                  };
                })}
                type="pie"
                title="Usage by Role"
                subtitle="Student vs Faculty booking distribution"
              />
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <h3 className="text-xl font-semibold mb-2">Resource Alerts</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Underutilized resources ({"<"} 2 bookings in 30 days)
                </p>
                <div className="space-y-3">
                  {analyticsData.underutilized.filter((r) => r.underused)
                    .length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No underutilized resources detected.
                    </p>
                  ) : (
                    analyticsData.underutilized
                      .filter((r) => r.underused)
                      .map((r) => (
                        <div
                          key={r._id}
                          className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-red-200">{r.name}</p>
                            <p className="text-xs text-red-400/80">
                              {r.bookingCount} bookings in 30 days
                            </p>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                            Promote
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <AnalyticsChart
              data={analyticsData.heatmap}
              type="heatmap"
              title="Global Usage Heatmap"
              subtitle="Concentration of bookings by day and hour"
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <AnalyticsChart
                data={analyticsData.topResources.map((r) => ({
                  name: r.name,
                  value: r.count,
                }))}
                type="bar"
                title="Top 5 Resources"
                subtitle="Most frequently booked resources"
              />
              <AnalyticsChart
                data={analyticsData.overallStatus.map((s) => ({
                  name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
                  value: s.count,
                }))}
                type="pie"
                title="Booking Status Breakdown"
                subtitle="Approved, Pending & Rejected distribution"
              />
              <AnalyticsChart
                data={analyticsData.peakHours.map((p) => ({
                  name: `${p._id}:00`,
                  value: p.count,
                }))}
                type="bar"
                title="Peak Booking Hours"
                subtitle="Top 5 busiest time slots"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <AnalyticsChart
                  data={analyticsData.timeline}
                  type="gantt"
                  title="Resource Occupancy Timeline"
                  subtitle="Next 14 days availability forecast"
                />
              </div>
              <div className="xl:col-span-1">
                <TensorFlowInsights
                  data={analyticsData.daily.map((d) => d.bookingCount)}
                  roleData={analyticsData.roleUsage}
                  peakData={analyticsData.peakHours}
                />
              </div>
            </div>
          </div>
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
