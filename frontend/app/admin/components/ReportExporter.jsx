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

  const formatHour = (h) => {
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${display}:00 ${ampm}`;
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(
        dateStr.includes("T") ? dateStr : dateStr + "T00:00:00",
      );
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleExport = () => {
    setLoading(true);
    let csv = "";
    let filename = "";

    switch (exportType) {
      case "daily": {
        // Use raw bookings for resource-level detail
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentBookings = (bookings || []).filter((b) => {
          const bd = new Date(b.date);
          return b.status === "approved" && bd >= sevenDaysAgo;
        });
        const rows = recentBookings.map((b) => ({
          Date: formatDate(b.date),
          "Resource Name": b.resource?.name || b.resource || "N/A",
          "Start Time": b.startTime || "",
          "End Time": b.endTime || "",
          "Booked By": b.requester?.name || "N/A",
        }));
        csv = generateCSV(rows, [
          "Date",
          "Resource Name",
          "Start Time",
          "End Time",
          "Booked By",
        ]);
        filename = "daily-usage.csv";
        break;
      }
      case "weekly": {
        // Group bookings by week with resource names, hours, and count
        const weekMap = {};
        (bookings || [])
          .filter((b) => b.status === "approved")
          .forEach((b) => {
            const bd = new Date(b.date);
            const weekNum = Math.ceil(
              ((bd - new Date(bd.getFullYear(), 0, 1)) / 86400000 + 1) / 7,
            );
            const weekLabel = `Week ${weekNum} of ${bd.getFullYear()}`;
            const resName = b.resource?.name || b.resource || "N/A";
            const key = `${weekLabel}__${resName}`;
            if (!weekMap[key]) {
              weekMap[key] = {
                Week: weekLabel,
                "Resource Name": resName,
                hours: 0,
                count: 0,
              };
            }
            // Calculate hours from startTime/endTime
            const [sh, sm] = (b.startTime || "0:0").split(":").map(Number);
            const [eh, em] = (b.endTime || "0:0").split(":").map(Number);
            weekMap[key].hours += eh + em / 60 - (sh + sm / 60);
            weekMap[key].count += 1;
          });
        const rows = Object.values(weekMap).map((r) => ({
          Week: r.Week,
          "Resource Name": r["Resource Name"],
          "Hours Booked": Math.round(r.hours * 10) / 10,
          "Total Bookings": r.count,
        }));
        csv = generateCSV(rows, [
          "Week",
          "Resource Name",
          "Hours Booked",
          "Total Bookings",
        ]);
        filename = "weekly-usage.csv";
        break;
      }
      case "monthly": {
        // Group bookings by month with resource names, hours, and count
        const monthMap = {};
        (bookings || [])
          .filter((b) => b.status === "approved")
          .forEach((b) => {
            const bd = new Date(b.date);
            const monthName = bd.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
            const resName = b.resource?.name || b.resource || "N/A";
            const key = `${monthName}__${resName}`;
            if (!monthMap[key]) {
              monthMap[key] = {
                Month: monthName,
                "Resource Name": resName,
                hours: 0,
                count: 0,
              };
            }
            const [sh, sm] = (b.startTime || "0:0").split(":").map(Number);
            const [eh, em] = (b.endTime || "0:0").split(":").map(Number);
            monthMap[key].hours += eh + em / 60 - (sh + sm / 60);
            monthMap[key].count += 1;
          });
        const rows = Object.values(monthMap).map((r) => ({
          Month: r.Month,
          "Resource Name": r["Resource Name"],
          "Hours Booked": Math.round(r.hours * 10) / 10,
          "Total Bookings": r.count,
        }));
        csv = generateCSV(rows, [
          "Month",
          "Resource Name",
          "Hours Booked",
          "Total Bookings",
        ]);
        filename = "monthly-usage.csv";
        break;
      }
      case "peak": {
        // Group by hour + resource for resource-level detail
        const peakMap = {};
        (bookings || [])
          .filter((b) => b.status === "approved" && b.startTime)
          .forEach((b) => {
            const hour = parseInt(b.startTime.split(":")[0], 10);
            const resName = b.resource?.name || b.resource || "N/A";
            const key = `${hour}__${resName}`;
            if (!peakMap[key]) {
              peakMap[key] = { hour, "Resource Name": resName, count: 0 };
            }
            peakMap[key].count += 1;
          });
        const rows = Object.values(peakMap)
          .sort((a, b) => b.count - a.count)
          .map((r) => ({
            "Peak Hour": formatHour(r.hour),
            "Resource Name": r["Resource Name"],
            "Number of Bookings": r.count,
          }));
        csv = generateCSV(rows, [
          "Peak Hour",
          "Resource Name",
          "Number of Bookings",
        ]);
        filename = "peak-hours.csv";
        break;
      }
      case "underused":
        csv = generateCSV(
          analyticsData.underutilized.map((r) => ({
            "Resource Name": r.name,
            Type: r.type,
            "Total Bookings": r.bookingCount || r.totalBookings || 0,
          })),
          ["Resource Name", "Type", "Total Bookings"],
        );
        filename = "underused-resources.csv";
        break;
      case "roles":
        csv = generateCSV(
          analyticsData.roleUsage.map((r) => ({
            Role:
              (r.role || r._id || "").charAt(0).toUpperCase() +
              (r.role || r._id || "").slice(1),
            "Number of Bookings": r.count || 0,
          })),
          ["Role", "Number of Bookings"],
        );
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
