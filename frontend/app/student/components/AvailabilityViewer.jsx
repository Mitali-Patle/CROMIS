"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

/* helper */
const getDatesBetween = (start, end) => {
  const dates = [];
  let d = new Date(start);
  const last = new Date(end);

  while (d <= last) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
};

export default function AvailabilityViewer({
  resource,
  date,
  endDate,
  onData,
}) {
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resource || !date) return;

    const loadAvailability = async () => {
      setLoading(true);
<<<<<<< HEAD
      const dates = endDate ? getDatesBetween(date, endDate) : [date];
=======
      const dates = endDate
        ? getDatesBetween(date, endDate)
        : [date];
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692

      const results = [];

      for (const d of dates) {
        try {
          const res = await apiRequest(
<<<<<<< HEAD
            `/bookings/booked-slots?resource=${resource}&date=${d}`,
=======
            `/bookings/booked-slots?resource=${resource}&date=${d}`
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
          );
          results.push({
            date: d,
            slots: res.bookedSlots || [],
          });
        } catch {
          results.push({ date: d, slots: [] });
        }
      }

      setDaily(results);
<<<<<<< HEAD
      onData && onData(results.flatMap((r) => r.slots));
=======
      onData && onData(results.flatMap(r => r.slots));
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
      setLoading(false);
    };

    loadAvailability();
  }, [resource, date, endDate]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Checking availability…</p>;
  }

  return (
<<<<<<< HEAD
    <div className="border border-gray-700 rounded p-3 bg-black space-y-3">
      <h4 className="text-sm font-semibold text-gray-300">
        📅 Availability & Booked Slots
      </h4>

      {daily.length === 0 && <p className="text-xs text-gray-500">No data</p>}

      {daily.map((d) => (
        <div key={d.date} className="text-sm border-l-2 border-blue-500 pl-3">
          <p className="font-medium text-gray-300 mb-1">{d.date}</p>

          {d.slots.length === 0 ? (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
              <p className="text-xs text-green-400">
                ✓ Fully Available - No bookings
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-yellow-400 mb-2">
                ⚠️ {d.slots.length} slot(s) already booked:
              </p>
              <ul className="text-xs space-y-1">
                {d.slots.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-red-400 bg-red-500/10 px-2 py-1 rounded"
                  >
                    <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    <span className="font-mono">
                      {s.startTime} – {s.endTime}
                    </span>
                    <span className="text-gray-500 text-[10px]">(Booked)</span>
                  </li>
                ))}
              </ul>
            </div>
=======
    <div className="border border-gray-700 rounded p-3 bg-gray-900 space-y-3">
      <h4 className="text-sm font-semibold text-gray-300">
        Availability (per day)
      </h4>

      {daily.length === 0 && (
        <p className="text-xs text-gray-500">No data</p>
      )}

      {daily.map((d) => (
        <div key={d.date} className="text-sm">
          <p className="font-medium text-gray-300">{d.date}</p>

          {d.slots.length === 0 ? (
            <p className="text-xs text-green-400">No bookings</p>
          ) : (
            <ul className="text-xs text-red-400 space-y-1">
              {d.slots.map((s, i) => (
                <li key={i}>
                  {s.startTime} – {s.endTime}
                </li>
              ))}
            </ul>
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
          )}
        </div>
      ))}
    </div>
  );
}
