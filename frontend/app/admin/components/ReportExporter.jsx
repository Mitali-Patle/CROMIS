"use client";

import React, { useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

const ReportExporter = ({ analyticsData, bookings, pendingBookings }) => {
  const [exportType, setExportType] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const options = [
    { value: "daily", label: "Daily Usage", icon: Calendar },
    { value: "weekly", label: "Weekly Usage", icon: Calendar },
    { value: "monthly", label: "Monthly Usage", icon: Calendar },
    { value: "peak", label: "Peak Hours", icon: Clock },
    { value: "underused", label: "Underused Resources", icon: FileText },
    { value: "roles", label: "Role Comparisons", icon: Users },
    { value: "bookings", label: "All Bookings", icon: FileText },
    { value: "pending", label: "Pending Bookings", icon: FileText },
  ];

  const selectedOption = options.find((opt) => opt.value === exportType);

  const generateCSV = (data, headers) => {
    if (data.length === 0) return "No data available";
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((field) => JSON.stringify(row[field] || "")).join(","),
      ),
    ].join("\n");
    return csv;
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    setLoading(true);
    let csv = "";
    let filename = "";

    switch (exportType) {
      case "daily":
        csv = generateCSV(analyticsData.daily, ["_id", "totalBookings"]);
        filename = "daily-usage.csv";
        break;
      case "weekly":
        csv = generateCSV(analyticsData.weekly, ["_id", "totalBookings"]);
        filename = "weekly-usage.csv";
        break;
      case "monthly":
        csv = generateCSV(analyticsData.weekly, ["_id", "totalBookings"]);
        filename = "monthly-usage.csv";
        break;
      case "peak":
        csv = generateCSV(analyticsData.peakHours, ["_id", "count"]);
        filename = "peak-hours.csv";
        break;
      case "underused":
        csv = generateCSV(analyticsData.underutilized, [
          "name",
          "type",
          "totalBookings",
        ]);
        filename = "underused-resources.csv";
        break;
      case "roles":
        csv = generateCSV(analyticsData.roleUsage, ["_id", "count"]);
        filename = "role-usage.csv";
        break;
      case "bookings":
        csv = generateCSV(bookings, [
          "_id",
          "requester.name",
          "resource.name",
          "date",
          "status",
        ]);
        filename = "all-bookings.csv";
        break;
      case "pending":
        csv = generateCSV(pendingBookings, [
          "_id",
          "requester.name",
          "resource.name",
          "date",
          "status",
        ]);
        filename = "pending-bookings.csv";
        break;
      default:
        csv = "No data available";
        filename = "report.csv";
    }

    downloadCSV(csv, filename);
    setLoading(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectOption = (value) => {
    setExportType(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-medium mb-4 text-white">Export Reports</h3>
      {/* Custom Dropdown */}
      <div className="relative mb-4">
        <button
          onClick={toggleDropdown}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition"
        >
          <span className="flex items-center gap-2">
            {selectedOption.icon && <selectedOption.icon className="w-4 h-4" />}
            {selectedOption.label}
          </span>
          {isDropdownOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isDropdownOpen && (
          <div className="absolute w-full top-full left-0 mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-10 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => selectOption(option.value)}
                className={`w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 transition flex items-center gap-2 ${
                  exportType === option.value ? "bg-gray-700" : ""
                }`}
              >
                {option.icon && <option.icon className="w-4 h-4" />}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 transition"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download Report
          </>
        )}
      </button>
    </div>
  );
};

export default ReportExporter;