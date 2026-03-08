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
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const ResourceForm = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    capacity: "",
    description: "",
    tags: "",
    availableFrom: "",
    availableTo: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null); // For edit mode

  // Fetch all resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/resources");
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      let result;
      if (editingId) {
        // Update
        result = await apiRequest(`/resources/${editingId}`, "PATCH", formData);
        setEditingId(null);
      } else {
        // Create
        result = await apiRequest("/resources", "POST", formData);
      }
      setFormData({
        name: "",
        type: "",
        location: "",
        capacity: "",
        description: "",
        tags: "",
        availableFrom: "",
        availableTo: "",
        isActive: true,
      });
      fetchResources(); // Refresh list
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
      capacity: resource.capacity || "",
      description: resource.description || "",
      tags: Array.isArray(resource.tags) ? resource.tags.join(", ") : "",
      availableFrom: resource.availableFrom || "",
      availableTo: resource.availableTo || "",
      isActive: resource.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to deactivate this resource?")) {
      try {
        await apiRequest(`/resources/${id}`, "DELETE");
        fetchResources(); // Refresh list
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
      capacity: "",
      description: "",
      tags: "",
      availableFrom: "",
      availableTo: "",
      isActive: true,
    });
  };

  if (loading) return <p className="text-gray-400">Loading resources...</p>;
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
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" /> Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500"
                placeholder="e.g., Building 1, Floor 2"
                required
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

      {/* Resources List */}
      <div className="bg-black border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Existing Resources (
          {resources.length})
        </h3>
        {resources.length === 0 ? (
          <p className="text-gray-400">No resources found. Create one above.</p>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-96">
            {resources.map((resource) => (
              <div
                key={resource._id}
<<<<<<< HEAD
                className="flex justify-between items-center p-4 bg-black rounded-lg border border-gray-700"
=======
                className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-700"
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
              >
                <div className="flex-1">
                  <h4 className="font-medium text-white">{resource.name}</h4>
                  <p className="text-sm text-gray-400">
                    {resource.type} • {resource.location} • Capacity:{" "}
                    {resource.capacity || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {resource.description || "No description"} • Tags:{" "}
                    {resource.tags?.join(", ") || "None"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Available: {resource.availableFrom} to{" "}
                    {resource.availableTo} • Status:{" "}
                    {resource.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default ResourceForm;
=======
export default ResourceForm;
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
