"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function PurposeTemplates({ onSelect }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    apiRequest("/purpose-templates")
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  if (templates.length === 0) return null;

  return (
    <select
      onChange={(e) => onSelect(e.target.value)}
      className="w-full bg-gray-900 border border-gray-700 p-3 rounded"
    >
      <option value="">Select purpose template</option>
      {templates.map((t) => (
        <option key={t._id} value={t.text}>
          {t.text}
        </option>
      ))}
    </select>
  );
}
