"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { User, Mail, Pencil, Check, X } from "lucide-react";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/auth/me")
            .then((data) => {
                setProfile(data);
                setNewName(data.name);
            })
            .catch(() => setError("Failed to load profile."));
    }, []);

    const handleSave = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        setError("");
        try {
            const updated = await apiRequest("/auth/me", "PATCH", { name: newName.trim() });
            setProfile(updated);
            setNewName(updated.name);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.message || "Failed to update name.");
        } finally {
            setSaving(false);
        }
    };

    const initials = profile?.name
        ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <div className="space-y-6 max-w-lg">
            <h1 className="text-2xl font-bold">Profile</h1>

            {/* Avatar */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold select-none">
                    {initials}
                </div>
                <div>
                    <p className="text-lg font-semibold">{profile?.name || "—"}</p>
                    <p className="text-sm text-gray-400 capitalize">{profile?.role || "—"}</p>
                </div>
            </div>

            {/* Info Card */}
            <div className="border border-gray-700 rounded-lg bg-black divide-y divide-gray-800">

                {/* Name Row */}
                <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Full Name</p>
                            {editing ? (
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white"
                                    maxLength={80}
                                />
                            ) : (
                                <p className="text-sm font-medium">{profile?.name || "—"}</p>
                            )}
                        </div>
                    </div>

                    {editing ? (
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-white text-black px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                                {saving ? "Saving…" : <><Check className="w-3 h-3" /> Save</>}
                            </button>
                            <button
                                onClick={() => { setEditing(false); setNewName(profile?.name || ""); setError(""); }}
                                className="bg-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="text-gray-400 hover:text-white transition-colors flex-shrink-0 flex items-center gap-1 text-sm"
                        >
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    )}
                </div>

                {/* Email Row */}
                <div className="p-4 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Email Address</p>
                        <p className="text-sm font-medium">{profile?.email || "—"}</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-600 border border-gray-700 rounded px-2 py-0.5">read-only</span>
                </div>

                {/* Role Row */}
                <div className="p-4 flex items-center gap-3">
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Role</p>
                        <p className="text-sm font-medium capitalize">{profile?.role || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Feedback */}
            {saved && (
                <p className="text-sm text-white border border-gray-700 rounded px-3 py-2 bg-gray-900">
                    ✓ Name updated successfully
                </p>
            )}
            {error && (
                <p className="text-sm text-gray-300 border border-gray-700 rounded px-3 py-2 bg-gray-900">
                    {error}
                </p>
            )}
        </div>
    );
}
