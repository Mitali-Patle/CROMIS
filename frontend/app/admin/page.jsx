"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Loader2,
  Download,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import DashboardSummary from "./components/DashboardSummary";
import ResourceForm from "./components/ResourceForm";
import BookingList from "./components/BookingList";
import AnalyticsChart from "./components/AnalyticsChart";
import TensorFlowInsights from "./components/TensorFlowInsights";
import ReportExporter from "./components/ReportExporter";
import { apiRequest } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AdminPage() {
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
  const [pendingBookings, setPendingBookings] = useState([]); // For pending-specific visualization
  const [analyticsData, setAnalyticsData] = useState({
    daily: [],
    weekly: [],
    peakHours: [],
    underutilized: [],
    roleUsage: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummaryData = async () => {
    try {
      const [resourcesRes, bookingsRes] = await Promise.all([
        apiRequest("/resources"),
        apiRequest("/bookings"),
      ]);
      const totalResources = resourcesRes.length;
      const allBookings = bookingsRes;
      const pendingProposals = allBookings.filter(
        (b) => b.status === "pending",
      ).length;
      const approvedRequests = allBookings.filter(
        (b) => b.status === "approved",
      ).length;
      const rejectedRequests = allBookings.filter(
        (b) => b.status === "rejected",
      ).length;
      // Occupancy: Simple calc
      const currentOccupancy = `${Math.round((approvedRequests / (totalResources * 10)) * 100)}%`;

      setSummaryData({
        totalResources,
        pendingProposals,
        approvedRequests,
        rejectedRequests,
        currentOccupancy,
      });
      setPendingBookings(allBookings.filter((b) => b.status === "pending"));
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await apiRequest("/bookings");
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [daily, weekly, peakHours, underutilized, roleUsage] =
        await Promise.all([
          apiRequest("/analytics/daily"),
          apiRequest("/analytics/weekly"),
          apiRequest("/analytics/peak-hours"),
          apiRequest("/analytics/underutilized"),
          apiRequest("/analytics/role-usage"),
        ]);
      setAnalyticsData({ daily, weekly, peakHours, underutilized, roleUsage });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      await Promise.all([
        fetchSummaryData(),
        fetchBookings(),
        fetchAnalytics(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      await apiRequest(`/bookings/${bookingId}`, "PATCH", {
        status: "approved",
      });
      fetchBookings();
      fetchSummaryData(); // Refresh summary
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await apiRequest(`/bookings/${bookingId}`, "PATCH", {
        status: "rejected",
      });
      fetchBookings();
      fetchSummaryData(); // Refresh summary
    } catch (err) {
      setError(err.message);
    }
  };

  const PendingRequestsChart = ({ data }) => {
    // Sample data for pending trends (customize with backend if needed)
    const chartData = data.slice(-7).map((b, index) => ({
      date: `Day ${index + 1}`,
      pending: data.slice(-7).filter((_, i) => i <= index).length,
    }));

    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Pending Requests Trend (Last 7)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#3B82F6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-between text-sm text-gray-400">
          <span>Total Pending: {data.length}</span>
          <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <DashboardSummary data={summaryData} />
            <PendingRequestsChart data={pendingBookings} />{" "}
            {/* New pending chart */}
          </div>
        );
      case "resources":
        return <ResourceForm />;
      case "bookings":
        return <BookingList bookings={bookings} mode="history" />;
      case "approvals":
        return (
          <div className="space-y-6">
            <PendingRequestsChart data={pendingBookings} />{" "}
            {/* Reuse in approvals */}
            <BookingList
              bookings={bookings.filter((b) => b.status === "pending")}
              mode="approval"
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <AnalyticsChart
              data={analyticsData.daily.map((d) => d.totalBookings)}
              type="line"
              title="Daily Utilization"
            />
            <AnalyticsChart
              data={analyticsData.weekly.map((w) => w.totalBookings)}
              type="line"
              title="Weekly Utilization"
            />
            <AnalyticsChart
              data={analyticsData.peakHours.map((p) => ({
                name: `Hour ${p._id}`,
                value: p.count,
              }))}
              type="bar"
              title="Peak Hours"
            />
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                Underutilized Resources
              </h3>
              <ul className="space-y-2">
                {analyticsData.underutilized.map((r, i) => (
                  <li key={i} className="text-sm text-gray-300">
                    {r.name} ({r.totalBookings} bookings)
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Usage by Role</h3>
              <ul className="space-y-2">
                {analyticsData.roleUsage.map((role, i) => (
                  <li key={i} className="text-sm text-gray-300">
                    {role._id}: {role.count} bookings
                  </li>
                ))}
              </ul>
            </div>
            <TensorFlowInsights
              data={analyticsData.daily.map((d) => d.totalBookings)}
            />
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
        return <DashboardSummary data={summaryData} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-blue-400"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex">
      <Sidebar
        onNavClick={setActiveTab}
        activeTab={activeTab}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Mobile Hamburger */}
        <header className="bg-black border-b border-gray-800 p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <div className="w-6" /> {/* Spacer */}
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-black">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 capitalize text-white">
              {activeTab.replace(/_/g, " ")}
            </h2>
          </div>
          <div className="space-y-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
