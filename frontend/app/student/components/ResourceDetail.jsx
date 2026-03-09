"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
    MapPin,
    Users,
    Clock,
    Tag,
    BookOpen,
    AlertTriangle,
    Paperclip,
    ArrowLeft,
    Calendar,
} from "lucide-react";

const API_BASE =
    typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"
        : "http://localhost:5000";

export default function ResourceDetail({ resourceId, onBack }) {
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await apiRequest(`/resources/${resourceId}`);
                setResource(res);
                // Get today's availability
                const today = new Date().toISOString().split("T")[0];
                const avail = await apiRequest(
                    `/resources/availability/check?date=${today}`,
                );
                const mine = avail.find((a) => a._id === resourceId);
                setAvailability(mine);
            } catch {
                setResource(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [resourceId]);

    if (loading) {
        return <p className="text-gray-400 animate-pulse">Loading resource...</p>;
    }

    if (!resource) {
        return <p className="text-red-400">Resource not found.</p>;
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Calendar
            </button>

            {/* Hero */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                {resource.imageUrl && (
                    <img
                        src={`${API_BASE}${resource.imageUrl}`}
                        alt={resource.name}
                        className="w-full h-52 object-cover"
                    />
                )}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">{resource.name}</h2>
                        {availability && (
                            <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${availability.isAvailable
                                        ? "bg-green-900 text-green-300"
                                        : "bg-red-900 text-red-300"
                                    }`}
                            >
                                {availability.isAvailable ? "Available Today" : "Booked Today"}
                            </span>
                        )}
                    </div>

                    {resource.maintenanceReason && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-950 border border-yellow-800 rounded-lg text-yellow-300 text-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>
                                Under maintenance: {resource.maintenanceReason}
                                {resource.maintenanceEndDate &&
                                    ` (until ${new Date(resource.maintenanceEndDate).toLocaleDateString()})`}
                            </span>
                        </div>
                    )}

                    <p className="text-gray-400">{resource.description || "No description available."}</p>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-500">Type:</span> {resource.type}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            {resource.building && resource.room
                                ? `${resource.building}, ${resource.room}`
                                : resource.location}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Users className="w-4 h-4 text-gray-500" />
                            Capacity: {resource.capacity || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {resource.availableFrom || "?"} – {resource.availableTo || "?"}
                        </div>
                    </div>

                    {/* Tags */}
                    {resource.tags?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-gray-500" />
                            {resource.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Instructions */}
                    {resource.instructions && (
                        <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4" /> Instructions / Guidelines
                            </h4>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">
                                {resource.instructions}
                            </p>
                        </div>
                    )}

                    {/* Today's booked slots */}
                    {availability && !availability.isAvailable && availability.bookings?.length > 0 && (
                        <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg">
                            <h4 className="text-sm font-semibold text-red-300 flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4" /> Booked Slots Today
                            </h4>
                            <div className="space-y-1">
                                {availability.bookings.map((b, i) => (
                                    <div
                                        key={i}
                                        className="text-sm text-red-300 bg-red-900/40 px-3 py-1.5 rounded"
                                    >
                                        {b.startTime} – {b.endTime}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    {resource.documents?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                <Paperclip className="w-4 h-4" /> Documents / Blueprints
                            </h4>
                            <div className="space-y-1">
                                {resource.documents.map((doc, i) => (
                                    <a
                                        key={i}
                                        href={`${API_BASE}${doc}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm text-blue-300 hover:text-blue-200 hover:bg-gray-700 transition"
                                    >
                                        <Paperclip className="w-3 h-3" />
                                        {doc.split("/").pop()}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
