
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ChangeLogEntry {
  id: string;
  workflow_id: string;
  action: string;
  created_at: string;
  profiles?: { display_name: string };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading history...</div>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-white mb-1">Change History</h1>
      <p className="text-sm text-gray-500 mb-6">
        Full audit log across all your workflows.
      </p>

      <div className="space-y-2">
        {history.map(entry => (
          <Link
            key={entry.id}
            href={`/workflows/${entry.workflow_id}`}
            className="flex items-center justify-between bg-surface-2 border border-border rounded-lg px-4 py-3 hover:border-brand-orange/30 transition-colors"
          >
            <div>
              <p className="text-sm text-white">{entry.action.replace(/_/g, " ")}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                by {entry.profiles?.display_name || "system"}
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(entry.created_at).toLocaleString()}
            </span>
          </Link>
        ))}
        {history.length === 0 && (
          <p className="text-sm text-gray-500">No history yet.</p>
        )}
      </div>
    </div>
  );
}