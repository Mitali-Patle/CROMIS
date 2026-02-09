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
      const dates = endDate
        ? getDatesBetween(date, endDate)
        : [date];

      const results = [];

      for (const d of dates) {
        try {
          const res = await apiRequest(
            `/bookings/booked-slots?resource=${resource}&date=${d}`
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
      onData && onData(results.flatMap(r => r.slots));
      setLoading(false);
    };

    loadAvailability();
  }, [resource, date, endDate]);

  if (loading) {
    return <p className="text-gray-400 text-sm">Checking availability…</p>;
  }

  return (
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
          )}
        </div>
      ))}
    </div>
  );
}
