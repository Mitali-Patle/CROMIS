"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Clock, Users, MapPin, Calendar } from "lucide-react";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    drafts: 0,
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookings, drafts, resourcesData] = await Promise.all([
          apiRequest("/bookings/my"),
          apiRequest("/drafts"),
          apiRequest("/resources"),
        ]);

        setStats({
          total: bookings.length,
          pending: bookings.filter((b) => b.status === "pending").length,
          approved: bookings.filter((b) => b.status === "approved").length,
          drafts: drafts.length,
        });

        setResources(resourcesData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="Total Proposals" value={stats.total} />
        <Stat title="Pending" value={stats.pending} />
        <Stat title="Approved" value={stats.approved} />
        <Stat title="Drafts" value={stats.drafts} />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={() => onNavigate("new")}
          className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition-colors"
        >
          New Proposal
        </button>
        <button
          onClick={() => onNavigate("my")}
          className="bg-gray-700 px-6 py-3 rounded hover:bg-gray-600 transition-colors"
        >
          My Proposals
        </button>
      </div>

      {/* Available Resources Section */}
      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-xl font-bold mb-4">Available Resources</h3>

        {loading ? (
          <p className="text-gray-400">Loading resources...</p>
        ) : resources.length === 0 ? (
          <p className="text-gray-400">No resources available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onBook={() => {
                  // Pre-select this resource in the form
                  localStorage.setItem("preselectedResource", resource._id);
                  onNavigate("new");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-black border border-gray-800 p-4 rounded">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ResourceCard({ resource, onBook }) {
  return (
    <div className="bg-black border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors">
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-lg text-white">{resource.name}</h4>
          <p className="text-sm text-gray-400 mt-1">{resource.description}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>{resource.location || "Location not specified"}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-green-400" />
            <span>Capacity: {resource.capacity || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span>
              {resource.availableFrom || "08:00"} -{" "}
              {resource.availableTo || "20:00"}
            </span>
          </div>

          {resource.type && (
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="capitalize">{resource.type}</span>
            </div>
          )}
        </div>

        <button
          onClick={onBook}
          className="w-full mt-3 bg-white hover:bg-gray-200 text-black py-2 rounded-lg font-medium transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
