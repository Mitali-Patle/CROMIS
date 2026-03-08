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
<<<<<<< HEAD
          `/resources/availability/check?date=${date}`,
=======
          `/resources/availability/check?date=${date}`
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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
<<<<<<< HEAD
        className="bg-black border border-gray-700 p-3 rounded w-fit"
=======
        className="bg-gray-900 border border-gray-700 p-3 rounded w-fit"
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

<<<<<<< HEAD
      {loading && <p className="text-gray-400">Loading availability...</p>}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && date && availability.length === 0 && (
        <p className="text-gray-400">No resources found for this date.</p>
=======
      {loading && (
        <p className="text-gray-400">Loading availability...</p>
      )}

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {!loading && date && availability.length === 0 && (
        <p className="text-gray-400">
          No resources found for this date.
        </p>
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
      )}

      {/* Availability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availability.map((res) => (
          <div
            key={res._id}
<<<<<<< HEAD
            className="bg-black p-4 rounded border border-gray-700"
          >
            <h3 className="font-semibold text-white">{res.name}</h3>

            {res.isAvailable ? (
              <p className="text-green-400 mt-2">Available</p>
=======
            className="bg-gray-900 p-4 rounded border border-gray-700"
          >
            <h3 className="font-semibold text-white">
              {res.name}
            </h3>

            {res.isAvailable ? (
              <p className="text-green-400 mt-2">
                Available
              </p>
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
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
<<<<<<< HEAD
=======

>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
