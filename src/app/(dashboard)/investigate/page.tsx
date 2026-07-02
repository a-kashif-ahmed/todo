// src/app/(dashboard)/investigate/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Incident {
  id: string;
  workflow_id: string;
  error_message: string | null;
  detected_at: string;
  status: string;
}

export default function InvestigatePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

 useEffect(() => {
  async function loadIncidents() {
    try {
      const res = await fetch("/api/incidents?status=open");
      const data = await res.json();
      setIncidents(data.incidents ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  loadIncidents();
}, []);
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-white mb-1">Investigate</h1>
      <p className="text-sm text-gray-500 mb-6">Open incidents requiring attention.</p>

      {loading ? <p className="text-gray-500 text-sm px-5">Loading workflows...</p> : <div className="space-y-2">
        {incidents.map(inc => (
          <Link
            key={inc.id}
            href={`/workflows/${inc.workflow_id}/incidents/${inc.id}`}
            className="block bg-surface-2 border border-status-error/30 rounded-lg px-4 py-3 hover:border-status-error/50 transition-colors"
          >
            <p className="text-sm text-status-error">{inc.error_message || "Workflow failure"}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(inc.detected_at).toLocaleString()}
            </p>
          </Link>
        ))}
        {incidents.length === 0 && (
          <p className="text-sm text-gray-500">No open incidents. All workflows healthy.</p>
        )}
      </div>}
    </div>
  );
}