// /app/admin/components/ResourceForm.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Calendar,
  MapPin,
  Users,
  FileText,
  Tag,
  Clock,
  Edit3,
  Trash2,
  Plus,
  AlertTriangle,
  Shield,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  History,
  Building2,
  DoorOpen,
  X,
  Paperclip,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const ResourceForm = () => {
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state (Story 6)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMinCap, setFilterMinCap] = useState("");

  // History state (Story 15)
  const [historyResourceId, setHistoryResourceId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    building: "",
    room: "",
    capacity: "",
    description: "",
    tags: "",
    availableFrom: "",
    availableTo: "",
    isActive: true,
    image: null,
    instructions: "",
    maintenanceReason: "",
    maintenanceEndDate: "",
    ownerNotes: "",
    documents: null, // FileList for document uploads
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchResources();
  }, [page, searchQuery, filterType, filterMinCap]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", ITEMS_PER_PAGE);
      if (searchQuery) params.set("q", searchQuery);
      if (filterType) params.set("type", filterType);
      if (filterMinCap) params.set("minCapacity", filterMinCap);

      const data = await apiRequest(`/resources?${params.toString()}`);
      setResources(data.resources || data);
      setTotal(data.total || (data.resources ? data.resources.length : data.length));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file" && name === "documents") {
      setFormData((prev) => ({ ...prev, documents: files }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleTagsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      tags: e.target.value.split(",").map((tag) => tag.trim()),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Story 2: Warn on destructive changes during edit
      if (editingId) {
        const original = resources.find((r) => r._id === editingId);
        if (original) {
          const criticalFields = ["name", "type", "location", "building", "room", "capacity"];
          const changed = criticalFields.filter(
            (f) => String(formData[f] || "") !== String(original[f] || ""),
          );
          if (changed.length > 0) {
            const ok = confirm(
              `You are changing ${changed.join(", ")}. This may affect existing bookings. Continue?`,
            );
            if (!ok) return;
          }
        }
      }

      const hasImage = formData.image != null;
      const hasDocs = formData.documents != null && formData.documents.length > 0;
      let body;

      if (hasImage || hasDocs) {
        // Use FormData when files are selected
        body = new FormData();
        Object.keys(formData).forEach((key) => {
          if (key === "image" && formData[key]) {
            body.append(key, formData[key]);
          } else if (key === "documents" && formData[key]) {
            for (const f of formData[key]) {
              body.append("documents", f);
            }
          } else if (key !== "image" && key !== "documents") {
            body.append(key, formData[key]);
          }
        });
      } else {
        const { image, documents, ...jsonBody } = formData;
        body = jsonBody;
      }

      if (editingId) {
        await apiRequest(`/resources/${editingId}`, "PATCH", body);
        setEditingId(null);
      } else {
        await apiRequest("/resources", "POST", body);
      }
      resetForm();
      fetchResources();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource._id);
    setFormData({
      name: resource.name,
      type: resource.type,
      location: resource.location,
      building: resource.building || "",
      room: resource.room || "",
      capacity: resource.capacity || "",
      description: resource.description || "",
      tags: Array.isArray(resource.tags) ? resource.tags.join(", ") : "",
      availableFrom: resource.availableFrom || "",
      availableTo: resource.availableTo || "",
      isActive: resource.isActive,
      image: null,
      instructions: resource.instructions || "",
      maintenanceReason: resource.maintenanceReason || "",
      maintenanceEndDate: resource.maintenanceEndDate
        ? resource.maintenanceEndDate.substring(0, 10)
        : "",
      ownerNotes: resource.ownerNotes || "",
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to deactivate this resource?")) {
      try {
        await apiRequest(`/resources/${id}`, "DELETE");
        fetchResources();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      type: "",
      location: "",
      building: "",
      room: "",
      capacity: "",
      description: "",
      tags: "",
      availableFrom: "",
      availableTo: "",
      isActive: true,
      image: null,
      instructions: "",
      maintenanceReason: "",
      maintenanceEndDate: "",
      ownerNotes: "",
      documents: null,
    });
  };

  // Story 15: Fetch booking history for a resource
  const openHistory = async (resourceId) => {
    if (historyResourceId === resourceId) {
      setHistoryResourceId(null);
      return;
    }
    setHistoryResourceId(resourceId);
    setHistoryLoading(true);
    try {
      const data = await apiRequest(`/resources/${resourceId}/history`);
      setHistoryData(data);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (loading && resources.length === 0)
    return <p className="text-gray-400">Loading resources...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* Form for Create/Edit */}
      <div className="bg-black border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {editingId ? (
              <Edit3 className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {editingId ? "Edit Resource" : "Add New Resource"}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Settings className="w-4 h-4" /> Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Lecture Hall A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4" /> Type *
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Classroom"
                required
              />
            </div>
            {/* Story 9: Building + Room replace single location */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Building2 className="w-4 h-4" /> Building *
              </label>
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Science Building"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <DoorOpen className="w-4 h-4" /> Room *
              </label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Room 202"
              />
            </div>
            {/* Fallback: if building+room empty, allow free-text location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" /> Location (auto-filled from Building + Room)
              </label>
              <input
                type="text"
                name="location"
                value={
                  formData.building && formData.room
                    ? `${formData.building}, ${formData.room}`
                    : formData.location
                }
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Building 1, Floor 2"
                disabled={!!(formData.building && formData.room)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" /> Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., 30"
              />
            </div>
            <div>
              {/* Intentionally empty for grid alignment */}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <FileText className="w-4 h-4" /> Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="Brief description..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Tag className="w-4 h-4" /> Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleTagsChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., projector, wifi, accessible"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" /> Available From (Time)
              </label>
              <input
                type="time"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" /> Available To (Time)
              </label>
              <input
                type="time"
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
              {editingId && resources.find((r) => r._id === editingId)?.imageUrl && (
                <p className="text-xs text-gray-400 mt-2">Leave blank to keep current image.</p>
              )}
            </div>
            {/* Story 8: Document uploads */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Paperclip className="w-4 h-4" /> Documents / Blueprints (PDF, DOC, XLS, PPT — up to 5)
              </label>
              <input
                type="file"
                name="documents"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                multiple
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
              {editingId && resources.find((r) => r._id === editingId)?.documents?.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {resources.find((r) => r._id === editingId).documents.length} existing doc(s). New uploads are appended.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <BookOpen className="w-4 h-4" /> Instructions / Guidelines (max 2000 chars)
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., No food allowed. Turn off projector after use."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.instructions.length}/2000</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <AlertTriangle className="w-4 h-4" /> Maintenance Reason
              </label>
              <input
                type="text"
                name="maintenanceReason"
                value={formData.maintenanceReason}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Under renovation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4" /> Maintenance End Date
              </label>
              <input
                type="date"
                name="maintenanceEndDate"
                value={formData.maintenanceEndDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <Shield className="w-4 h-4" /> Owner Notes (admin only, max 100 chars)
              </label>
              <input
                type="text"
                name="ownerNotes"
                value={formData.ownerNotes}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Managed by Dr. Smith, CS Dept."
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded text-blue-600"
              />
              Active
            </label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition"
          >
            {editingId ? "Update Resource" : "Add Resource"}
          </button>
        </form>
      </div>

      {/* Story 6: Filter Bar */}
      <div className="bg-black border border-gray-700 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search resources..."
              className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
            />
          </div>
          <input
            type="text"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by type..."
            className="px-3 py-2 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm w-40"
          />
          <input
            type="number"
            value={filterMinCap}
            onChange={(e) => {
              setFilterMinCap(e.target.value);
              setPage(1);
            }}
            placeholder="Min capacity"
            className="px-3 py-2 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm w-32"
          />
          {(searchQuery || filterType || filterMinCap) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterType("");
                setFilterMinCap("");
                setPage(1);
              }}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-black border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Existing Resources ({total})
        </h3>
        {resources.length === 0 ? (
          <p className="text-gray-400">No resources found.</p>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <div key={resource._id}>
                <div className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{resource.name}</h4>
                    <p className="text-sm text-gray-400">
                      {resource.type} •{" "}
                      {resource.building && resource.room
                        ? `${resource.building}, ${resource.room}`
                        : resource.location}{" "}
                      • Capacity: {resource.capacity || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {resource.description || "No description"} • Tags:{" "}
                      {resource.tags?.join(", ") || "None"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Available: {resource.availableFrom} to {resource.availableTo} • Status:{" "}
                      {resource.isActive ? "Active" : "Inactive"}
                    </p>
                    {resource.maintenanceReason && (
                      <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Maintenance: {resource.maintenanceReason}
                        {resource.maintenanceEndDate &&
                          ` (until ${new Date(resource.maintenanceEndDate).toLocaleDateString()})`}
                      </p>
                    )}
                    {resource.instructions && (
                      <p className="text-xs text-blue-300 mt-1">
                        📋 Instructions: {resource.instructions.substring(0, 80)}
                        {resource.instructions.length > 80 ? "…" : ""}
                      </p>
                    )}
                    {resource.ownerNotes && (
                      <p className="text-xs text-purple-300 mt-1">
                        🔒 Owner: {resource.ownerNotes}
                      </p>
                    )}
                    {resource.imageUrl && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${resource.imageUrl}`}
                        alt={resource.name}
                        className="mt-2 h-16 w-16 object-cover rounded"
                      />
                    )}
                    {resource.documents?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resource.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs text-blue-300 hover:text-blue-200"
                          >
                            <Paperclip className="w-3 h-3" />
                            {doc.split("/").pop()}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openHistory(resource._id)}
                      className="p-2 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition"
                      title="Booking History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 text-blue-400 hover:text-blue-300 rounded hover:bg-gray-800 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource._id)}
                      className="p-2 text-red-400 hover:text-red-300 rounded hover:bg-gray-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Story 15: Booking History Panel */}
                {historyResourceId === resource._id && (
                  <div className="ml-4 mt-1 mb-2 p-3 bg-gray-950 border border-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-semibold text-gray-300 flex items-center gap-1">
                        <History className="w-3 h-3" /> Booking History
                      </h5>
                      <button
                        onClick={() => setHistoryResourceId(null)}
                        className="text-gray-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {historyLoading ? (
                      <p className="text-xs text-gray-500">Loading...</p>
                    ) : historyData.length === 0 ? (
                      <p className="text-xs text-gray-500">No booking history.</p>
                    ) : (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {historyData.map((b) => (
                          <div
                            key={b._id}
                            className="flex items-center justify-between text-xs p-2 rounded bg-gray-900"
                          >
                            <div>
                              <span className="text-gray-300">
                                {new Date(b.date).toLocaleDateString()} • {b.startTime}–{b.endTime}
                              </span>
                              {b.quantity > 1 && (
                                <span className="text-blue-400 ml-1">×{b.quantity}</span>
                              )}
                              <span className="text-gray-500 ml-2">
                                {b.requester?.name || "Unknown"}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${b.status === "approved"
                                ? "bg-green-900 text-green-300"
                                : b.status === "rejected"
                                  ? "bg-red-900 text-red-300"
                                  : b.status === "cancelled"
                                    ? "bg-gray-700 text-gray-400"
                                    : "bg-yellow-900 text-yellow-300"
                                }`}
                            >
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Story 6: Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} ({total} resources)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceForm;
