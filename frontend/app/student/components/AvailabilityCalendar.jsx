"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

export default function AvailabilityCalendar() {
  const [date, setDate] = useState("");
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) return;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest(
          `/resources/availability/check?date=${date}`,
        );
        setAvailability(data);
      } catch (err) {
        setError("Failed to load availability");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [date]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Resource Availability</h2>

      {/* Date Picker */}
      <input
        type="date"
        className="bg-black border border-gray-700 p-3 rounded w-fit"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {loading && <p className="text-gray-400">Loading availability...</p>}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && date && availability.length === 0 && (
        <p className="text-gray-400">No resources found for this date.</p>
      )}

      {/* Availability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availability.map((res) => (
          <div
            key={res._id}
            className="bg-black p-4 rounded border border-gray-700"
          >
            <h3 className="font-semibold text-white">{res.name}</h3>

            {res.isAvailable ? (
              <p className="text-green-400 mt-2">Available</p>
            ) : (
              <div className="mt-2">
                <p className="text-red-400">Booked Slots:</p>
                <ul className="text-sm text-gray-300 mt-1 space-y-1">
                  {res.bookings.map((b, i) => (
                    <li key={i}>
                      {b.startTime} – {b.endTime}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
