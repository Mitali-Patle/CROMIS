"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Calendar, User, Search, Filter, History, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";

// Native formatter for "MMM d" (e.g., Mar 8)
const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
};

// Native formatter for "MMM d, yyyy • HH:mm"
const formatDateFull = (date) => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(date)).replace(',', ' •');
};

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/audit?page=${page}&limit=20`);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError("Failed to load audit logs. Please ensure you have admin permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case "approve":
      case "approved":
        return "text-green-400 bg-green-400/10";
      case "reject":
      case "rejected":
        return "text-red-400 bg-red-400/10";
      case "edit":
        return "text-blue-400 bg-blue-400/10";
      case "expire":
      case "expired":
        return "text-orange-400 bg-orange-400/10";
      case "cancel":
      case "cancelled":
        return "text-gray-400 bg-gray-400/10";
      default:
        return "text-gray-200 bg-gray-800";
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="font-medium">Loading audit history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <History className="w-6 h-6 text-blue-400" />
          Audit Trail
        </h2>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-400">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">No audit records found yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {logs.map((log) => (
            <div key={log._id} className="group bg-gray-900/50 border border-gray-800 hover:border-gray-700 p-5 rounded-2xl transition-all hover:bg-gray-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{log.adminId?.name || "System"}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      Target: <span className="text-gray-200">
                        {log.proposalId?.resource?.name || "Unknown Resource"} • 
                        {log.proposalId ? formatDateShort(log.proposalId.date) : "Unknown Date"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {formatDateFull(log.timestamp)}
                  </span>
                  {log.note && (
                    <p className="text-xs text-gray-400 italic">"{log.note}"</p>
                  )}
                </div>
              </div>
              
              {/* Optional: Show expanded diff view if useful */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogList;
