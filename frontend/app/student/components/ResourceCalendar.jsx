"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
    ChevronLeft,
    ChevronRight,
    X,
    MapPin,
    Clock,
    Users,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n) {
    return String(n).padStart(2, "0");
}

function toDateStr(year, month, day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function startDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function isToday(year, month, day) {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

function isPast(year, month, day) {
    const d = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
}

// ─── Component ─────────────────────────────────────────
export default function ResourceCalendar({ onResourceClick }) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    // Cache: { "2026-03-08": [...availability] }
    const [cache, setCache] = useState({});
    // Which dates have bookings (for dots)
    const [busyDates, setBusyDates] = useState(new Set());
    // Loading state for the whole month
    const [monthLoading, setMonthLoading] = useState(false);

    // Pop-up state
    const [selectedDate, setSelectedDate] = useState(null);
    const [popupData, setPopupData] = useState([]);
    const [popupLoading, setPopupLoading] = useState(false);

    // ─── Prefetch the entire month to mark busy/free dots ───
    useEffect(() => {
        const fetchMonth = async () => {
            setMonthLoading(true);
            const daysInMonth = getDaysInMonth(year, month);
            const newBusy = new Set();
            const newCache = { ...cache };

            // Fetch each day (we batch but await sequentially to avoid overload)
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = toDateStr(year, month, d);
                if (newCache[dateStr]) {
                    // Already cached
                    const hasBusy = newCache[dateStr].some((r) => !r.isAvailable);
                    if (hasBusy) newBusy.add(dateStr);
                    continue;
                }
                try {
                    const data = await apiRequest(
                        `/resources/availability/check?date=${dateStr}`,
                    );
                    newCache[dateStr] = data;
                    if (data.some((r) => !r.isAvailable)) {
                        newBusy.add(dateStr);
                    }
                } catch {
                    newCache[dateStr] = [];
                }
            }

            setCache(newCache);
            setBusyDates(newBusy);
            setMonthLoading(false);
        };

        fetchMonth();
    }, [year, month]);

    // ─── Navigation handlers ───
    const prevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    // ─── Date click → open pop-up ───
    const handleDateClick = async (day) => {
        const dateStr = toDateStr(year, month, day);
        setSelectedDate(dateStr);

        if (cache[dateStr]) {
            setPopupData(cache[dateStr]);
            return;
        }

        setPopupLoading(true);
        try {
            const data = await apiRequest(
                `/resources/availability/check?date=${dateStr}`,
            );
            setPopupData(data);
            setCache((prev) => ({ ...prev, [dateStr]: data }));
        } catch {
            setPopupData([]);
        } finally {
            setPopupLoading(false);
        }
    };

    // ─── Build calendar grid ───
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = startDayOfMonth(year, month);

    const cells = [];
    // Empty cells before 1st
    for (let i = 0; i < startDay; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Resource Calendar</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-semibold min-w-[180px] text-center">
                        {MONTH_NAMES[month]} {year}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="flex gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> All available
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Has bookings
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600 inline-block" /> Past
                </span>
            </div>

            {monthLoading && (
                <p className="text-gray-400 text-sm animate-pulse">
                    Loading availability for {MONTH_NAMES[month]}…
                </p>
            )}

            {/* ── Calendar Grid ── */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {DAY_LABELS.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-semibold text-gray-500 py-2"
                    >
                        {d}
                    </div>
                ))}

                {/* Cells */}
                {cells.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} />;
                    }

                    const dateStr = toDateStr(year, month, day);
                    const past = isPast(year, month, day);
                    const today = isToday(year, month, day);
                    const busy = busyDates.has(dateStr);

                    return (
                        <button
                            key={dateStr}
                            onClick={() => handleDateClick(day)}
                            className={`
                relative flex flex-col items-center justify-center
                py-3 rounded-lg text-sm font-medium transition
                ${today ? "ring-2 ring-blue-500" : ""}
                ${past ? "text-gray-600 bg-gray-900/40" : "text-white bg-gray-900 hover:bg-gray-800 cursor-pointer"}
                ${selectedDate === dateStr ? "ring-2 ring-white" : ""}
              `}
                        >
                            {day}
                            {/* Dot indicator */}
                            {!past && cache[dateStr] && (
                                <span
                                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${busy ? "bg-red-500" : "bg-green-500"
                                        }`}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Pop-up (Modal) ── */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-700">
                            <h3 className="text-lg font-semibold">
                                Resources on{" "}
                                <span className="text-blue-400">
                                    {new Date(selectedDate + "T00:00").toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </h3>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="p-1 rounded hover:bg-gray-700 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body — scrollable */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {popupLoading && (
                                <p className="text-gray-400 animate-pulse">Loading…</p>
                            )}

                            {!popupLoading && popupData.length === 0 && (
                                <p className="text-gray-500">No resources found.</p>
                            )}

                            {!popupLoading &&
                                popupData.map((res) => (
                                    <div
                                        key={res._id}
                                        className={`p-4 rounded-lg border ${res.isAvailable
                                            ? "border-green-800 bg-green-950/30"
                                            : "border-red-800 bg-red-950/30"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4
                                                className="font-semibold text-white hover:text-blue-300 cursor-pointer transition"
                                                onClick={() => {
                                                    setSelectedDate(null);
                                                    onResourceClick?.(res._id);
                                                }}
                                            >{res.name}</h4>
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${res.isAvailable
                                                    ? "bg-green-900 text-green-300"
                                                    : "bg-red-900 text-red-300"
                                                    }`}
                                            >
                                                {res.isAvailable ? "Available" : "Booked"}
                                            </span>
                                        </div>

                                        {!res.isAvailable && res.bookings.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Booked slots:
                                                </p>
                                                {res.bookings.map((b, i) => (
                                                    <div
                                                        key={i}
                                                        className="text-sm text-red-300 bg-red-900/40 px-2 py-1 rounded"
                                                    >
                                                        {b.startTime} – {b.endTime}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
