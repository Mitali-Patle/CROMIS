"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import AvailabilityViewer from "./AvailabilityViewer";
import PurposeTemplates from "./PurposeTemplates";
import { Loader2 } from "lucide-react";

/* ================= HELPERS ================= */

const generateSlots = (start = "08:00", end = "20:00", step = 15) => {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  while (h < eh || (h === eh && m < em)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += step;
    if (m >= 60) {
      h++;
      m = 0;
    }
  }
  return slots;
};

const overlaps = (start, end, booked) =>
  booked.some((b) => start < b.endTime && end > b.startTime);

/* ================= COMPONENT ================= */

export default function ProposalForm() {
  const [activeTab, setActiveTab] = useState("single");
  const [resources, setResources] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    resource: "",
    date: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    recurrencePattern: "daily",
  });

  useEffect(() => {
    apiRequest("/resources")
      .then((data) => setResources(Array.isArray(data) ? data : data.resources || []))
      .catch(console.error);

    const preselected = localStorage.getItem("preselectedResource");
    if (preselected) {
      setForm((prev) => ({ ...prev, resource: preselected }));
      localStorage.removeItem("preselectedResource");
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("resumeDraft");
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      setForm((prev) => ({
        ...prev,
        resource: d.resource?._id || d.resource || "",
        date: d.startDate || "",
        startDate: d.startDate || "",
        endDate: d.endDate || "",
        startTime: d.startTime || "",
        endTime: d.endTime || "",
        purpose: d.purpose || "",
      }));
      setDraftId(d._id);
      localStorage.removeItem("resumeDraft");
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      let endpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/bookings`;
      const formData = new FormData();

      formData.append("resource", form.resource);
      formData.append("startTime", form.startTime);
      formData.append("endTime", form.endTime);
      formData.append("purpose", form.purpose);

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      if (activeTab === "single") {
        if (!form.date) return alert("Please select a date.");
        formData.append("date", form.date);
      } else if (activeTab === "multi") {
        if (!form.startDate || !form.endDate)
          return alert("Please select start and end dates.");
        if (form.startDate > form.endDate)
          return alert("Start date cannot be after end date.");
        endpoint += "/multi";
        formData.append("startDate", form.startDate);
        formData.append("endDate", form.endDate);
      } else if (activeTab === "recurring") {
        if (!form.startDate || !form.endDate)
          return alert("Please select start and end dates.");
        if (form.startDate > form.endDate)
          return alert("Start date cannot be after end date.");
        if (form.recurrencePattern === "daily") {
          endpoint += "/multi";
          formData.append("startDate", form.startDate);
          formData.append("endDate", form.endDate);
        } else if (form.recurrencePattern === "weekly") {
          endpoint += "/recurring";
          formData.append("startDate", form.startDate);
          formData.append("endDate", form.endDate);
          formData.append("recurrencePattern", "weekly");
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Booking failed");
      }

      const data = await res.json();

      if (activeTab === "single") {
        alert("Booking submitted successfully!");
      } else {
        const count = data.bookings?.length || 0;
        alert(
          `Successfully created ${count} bookings with Group ID: ${data.groupId}`,
        );
      }

      setForm({
        resource: "",
        date: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
        recurrencePattern: "daily",
      });
      setFiles([]);
      setDraftId(null);
    } catch (err) {
      alert(err.message || "Booking process failed");
    }
    setLoading(false);
  };

  const startSlots = generateSlots();
  const endSlots = form.startTime ? generateSlots(form.startTime) : [];
  const availabilityDate = activeTab === "single" ? form.date : form.startDate;

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-2xl">
        {/* TABS */}
        <div className="flex bg-black rounded-lg p-1 mb-6">
          {["single", "multi", "recurring"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                  ? "bg-gray-700 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {tab === "single"
                ? "Single"
                : tab === "multi"
                  ? "Multi-Day"
                  : "Recurring"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Resource */}
          <div>
            <select
              name="resource"
              required
              value={form.resource}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
            >
              <option value="">Select Resource</option>
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} - {r.availableFrom || "08:00"} to{" "}
                  {r.availableTo || "20:00"} (Capacity: {r.capacity || "N/A"})
                </option>
              ))}
            </select>
          </div>

          {/* Date Fields */}
          {activeTab === "single" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1 ml-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
          )}

          {(activeTab === "multi" || activeTab === "recurring") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 ml-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 ml-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  min={form.startDate}
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === "recurring" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1 ml-1">
                Recurrence
              </label>
              <select
                name="recurrencePattern"
                value={form.recurrencePattern}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
              >
                <option value="daily">Daily (Every Day)</option>
                <option value="weekly">Weekly (Same Day of Week)</option>
              </select>
            </div>
          )}

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 ml-1">
                Start Time
              </label>
              <select
                name="startTime"
                required
                value={form.startTime}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
              >
                <option value="">--:--</option>
                {startSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 ml-1">
                End Time
              </label>
              <select
                name="endTime"
                required
                value={form.endTime}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
              >
                <option value="">--:--</option>
                {endSlots
                  .filter((t) => !overlaps(form.startTime, t, bookedSlots))
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Purpose Templates */}
          <PurposeTemplates
            onSelect={(text) => setForm((f) => ({ ...f, purpose: text }))}
          />

          {/* Purpose */}
          <div>
            <textarea
              name="purpose"
              required
              minLength={10}
              value={form.purpose}
              onChange={handleChange}
              className="w-full h-24 bg-black border border-gray-700 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-white focus:outline-none placeholder-gray-500"
              placeholder="Purpose of booking"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2 border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Attachments</label>
              <label className="cursor-pointer text-white hover:text-gray-300 text-sm font-medium">
                + Add File
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={(e) =>
                    setFiles((prev) => [...prev, ...Array.from(e.target.files)])
                  }
                  className="hidden"
                />
              </label>
            </div>

            {files.length > 0 && (
              <ul className="text-sm bg-black rounded p-2 space-y-1">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center text-gray-300"
                  >
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles(files.filter((_, idx) => idx !== i))
                      }
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Submit Proposal"
            )}
          </button>
        </form>

        {form.resource && availabilityDate && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <AvailabilityViewer
              resource={form.resource}
              date={availabilityDate}
              onData={setBookedSlots}
            />
          </div>
        )}
      </div>
    </div>
  );
}
