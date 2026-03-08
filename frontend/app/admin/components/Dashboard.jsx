// components/Dashboard.jsx
"use client";

import React from "react";
import { Download, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = ({ summaryData, pendingBookings }) => {
  const cards = [
    {
      title: "Total Resources",
      value: summaryData.totalResources,
    },
    {
      title: "Pending Proposals",
      value: summaryData.pendingProposals,
    },
    {
      title: "Approved Requests",
      value: summaryData.approvedRequests,
    },
    {
      title: "Rejected Requests",
      value: summaryData.rejectedRequests,
    },
    {
      title: "Current Occupancy",
      value: summaryData.currentOccupancy,
    },
  ];

  // Sample data for pending trends (customize with backend if needed)
  const chartData = pendingBookings.slice(-7).map((b, index) => ({
    date: `Day ${index + 1}`,
    pending: pendingBookings.slice(-7).filter((_, i) => i <= index).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
<<<<<<< HEAD
            className="bg-black p-4 rounded-lg border border-gray-700"
=======
            className="bg-gray-900 p-4 rounded-lg border border-gray-700"
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
          >
            <h3 className="text-sm text-gray-400 mb-2">{card.title}</h3>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
<<<<<<< HEAD
      <div className="bg-black p-6 rounded-lg border border-gray-700">
=======
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Pending Requests Trend
          (Last 7)
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
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-between text-sm text-gray-400">
          <span>Total Pending: {pendingBookings.length}</span>
          <button className="flex items-center gap-1 text-white hover:text-gray-300">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Dashboard;
=======
export default Dashboard;
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
