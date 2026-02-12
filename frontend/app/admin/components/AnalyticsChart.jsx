// /app/admin/components/AnalyticsChart.jsx
import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const AnalyticsChart = ({
  data,
  type = "line",
  title = "Usage Trends",
  subtitle = "",
}) => {
  const chartRef = useRef(null);
  const [showDetails, setShowDetails] = useState(false);

  // Handle both array of numbers or array of objects
  let chartData = data;
  if (Array.isArray(data) && typeof data[0] === "number") {
    chartData = data.map((value, index) => ({
      name: `Period ${index + 1} `,
      value,
    }));
  }

  const handleExport = async () => {
    if (chartRef.current === null) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#111827",
      });
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "_")}_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. Please try again.");
    }
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#9CA3AF" interval="preserveStartEnd" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "none",
            borderRadius: "8px",
            color: "#FFF",
          }}
          formatter={(value) => [value, title]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalHours"
          name="Total Hours"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="bookingCount"
          name="Bookings"
          stroke="#10B981"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => {
    // Detect which data keys are present (excluding 'name')
    const sampleKeys =
      chartData.length > 0
        ? Object.keys(chartData[0]).filter((k) => k !== "name")
        : [];
    const barColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#FFF",
            }}
          />
          <Legend />
          {sampleKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={
                key.charAt(0).toUpperCase() +
                key.slice(1).replace(/([A-Z])/g, " $1")
              }
              fill={barColors[i % barColors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}% `
          }
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell - ${index} `}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "none",
            borderRadius: "8px",
            color: "#FFF",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  // Custom Heatmap implementation
  const renderHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Map data to a grid
    const grid = days.map((day, dIdx) => {
      return hours.map((hour) => {
        const entry = Array.isArray(chartData)
          ? chartData.find(
              (item) => item._id.day === dIdx + 1 && item._id.hour === hour,
            )
          : null;
        return entry ? entry.count : 0;
      });
    });

    const maxCount =
      Array.isArray(chartData) && chartData.length > 0
        ? Math.max(...chartData.map((d) => d.count), 1)
        : 1;

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[600px] grid grid-cols-[80px_repeat(24,1fr)] gap-1">
          <div className="h-6"></div>
          {hours.map((h) => (
            <div key={h} className="text-[10px] text-gray-400 text-center">
              {h}h
            </div>
          ))}

          {days.map((day, dIdx) => (
            <React.Fragment key={day}>
              <div className="text-sm text-gray-300 flex items-center">
                {day}
              </div>
              {grid[dIdx].map((count, hIdx) => {
                const intensity = count / maxCount;
                const opacity = 0.2 + intensity * 0.8;
                return (
                  <div
                    key={`${dIdx} -${hIdx} `}
                    className="h-8 rounded-sm cursor-help transition-all hover:scale-110"
                    style={{
                      backgroundColor:
                        count > 0
                          ? `rgba(59, 130, 246, ${opacity})`
                          : "#1F2937",
                      border: intensity > 0.8 ? "1px solid #60A5FA" : "none",
                    }}
                    title={`${day} ${hIdx}:00 - ${count} bookings`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Custom Gantt-style Timeline
  const renderGantt = () => (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {Array.isArray(chartData) &&
        chartData.map((resource) => (
          <div key={resource._id} className="space-y-1">
            <div className="text-sm font-medium text-gray-300 flex justify-between">
              <span>{resource.name}</span>
              <span className="text-xs text-blue-400">
                {resource.timeline?.length || 0} items
              </span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full relative overflow-hidden flex">
              {!resource.timeline || resource.timeline.length === 0 ? (
                <div className="w-full h-full bg-gray-800 opacity-30 flex items-center justify-center text-[10px] text-gray-600">
                  No upcoming bookings
                </div>
              ) : (
                resource.timeline.map((item, idx) => {
                  const totalWidth = 100; // Simplified 14-day view would be complex, showing relative distribution for now
                  return (
                    <div
                      key={idx}
                      className={`h - full border - r border - gray - 900 ${
                        item.status === "approved"
                          ? "bg-blue-500"
                          : "bg-yellow-500 opacity-60"
                      } `}
                      style={{ width: `${100 / resource.timeline.length}% ` }}
                      title={`${new Date(item.date).toLocaleDateString()} | ${item.startTime} -${item.endTime} | ${item.status} `}
                    />
                  );
                })
              )}
            </div>
          </div>
        ))}
      <div className="flex gap-4 text-xs mt-2 pt-2 border-t border-gray-800">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div> Approved
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 opacity-60 rounded"></div>{" "}
          Pending
        </div>
      </div>
    </div>
  );

  const renderDetailsTable = () => (
    <div className="max-h-[300px] overflow-auto border border-gray-700 rounded-lg">
      <table className="w-full text-left text-sm text-gray-300 border-collapse">
        <thead className="bg-gray-800 text-gray-400 sticky top-0">
          <tr>
            <th className="p-3">Label</th>
            <th className="p-3">Metric</th>
            <th className="p-3">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {Array.isArray(chartData) &&
            chartData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-800/50">
                <td className="p-3 font-medium text-white">
                  {item.name || item._id || `Item ${idx + 1} `}
                </td>
                <td className="p-3">
                  {item.totalHours ? "Hours" : item.count ? "Count" : "Metric"}
                </td>
                <td className="p-3 text-blue-400 font-mono">
                  {item.totalHours ||
                    item.bookingCount ||
                    item.count ||
                    item.value ||
                    "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    if (showDetails) return renderDetailsTable();
    switch (type) {
      case "bar":
        return renderBarChart();
      case "pie":
        return renderPieChart();
      case "heatmap":
        return renderHeatmap();
      case "gantt":
        return renderGantt();
      case "line":
      default:
        return renderLineChart();
    }
  };

  return (
    <div
      ref={chartRef}
      className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-2xl h-full flex flex-col"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!showDetails && (
            <button
              onClick={handleExport}
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 active:scale-95"
            >
              Export PNG
            </button>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors border active:scale-95 ${
              showDetails
                ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {showDetails ? "Show Chart" : "Details"}
          </button>
        </div>
      </div>
      <div className="flex-grow">{renderContent()}</div>
    </div>
  );
};

export default AnalyticsChart;
