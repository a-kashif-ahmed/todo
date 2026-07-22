// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/investigate/page.tsx
// Figma: Investigate — left incident list + right empty/active state
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, AlertTriangle, CheckCircle } from "lucide-react";

interface Incident {
  id: string;
  workflow_id: string;
  status: string;
  detected_at: string;
  error_message: string | null;
  root_cause: string | null;
  confidence: number | null;
}

interface Workflow { id: string; name: string; }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function InvestigatePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [incRes, wfRes] = await Promise.all([
        fetch("/api/incidents?status=open").then(r => r.json()),
        fetch("/api/workflows").then(r => r.json()),
      ]);
      setIncidents(incRes.incidents || []);
      const map: Record<string, string> = {};
      (wfRes.workflows || []).forEach((w: Workflow) => { map[w.id] = w.name; });
      setWorkflows(map);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Incident list ── */}
      <div className="w-80 flex-shrink-0 border-r border-border flex flex-col">
        {/* Stats */}
        <div className="p-4 border-b border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-2 border border-border rounded-xl p-3.5">
              <p className="text-[10px] text-text-muted uppercase mb-1">Avg. Time to Resolve</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-text-primary">14m</p>
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
                  <Clock size={14} className="text-text-muted" />
                </div>
              </div>
            </div>
            <div className="bg-surface-2 border border-border rounded-xl p-3.5">
              <p className="text-[10px] text-text-muted uppercase mb-1">AI Confidence Score</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-purple-400">94%</p>
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-purple-400">✦</div>
              </div>
            </div>
          </div>
        </div>

        {/* Incident list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] text-text-muted uppercase font-semibold tracking-wide border-b border-border">
            Last 24h
          </div>
          {loading ? (
            <p className="text-xs text-text-muted p-4">Loading...</p>
          ) : incidents.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle size={24} className="text-status-success mx-auto mb-2" />
              <p className="text-sm text-text-muted">No open incidents</p>
            </div>
          ) : (
            incidents.map(inc => (
              <button
                key={inc.id}
                onClick={() => setSelected(inc)}
                className={`w-full text-left px-4 py-3.5 border-b border-border-light hover:bg-surface-2/50 transition-colors ${selected?.id === inc.id ? "bg-surface-2" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-text-muted">{timeAgo(inc.detected_at)}</p>
                  <AlertTriangle size={12} className="text-status-error" />
                </div>
                <p className="text-sm font-medium text-text-primary truncate">{workflows[inc.workflow_id] || "Unknown workflow"}</p>
                <p className="text-xs text-text-muted mt-0.5 truncate">{inc.error_message || "Investigating..."}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT: Active or empty state ── */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">{workflows[selected.workflow_id] || "Unknown"}</h2>
                <p className="text-sm text-text-muted mt-0.5">{timeAgo(selected.detected_at)}</p>
              </div>
              <button
                onClick={() => router.push(`/workflows/${selected.workflow_id}/incidents/${selected.id}`)}
                className="bg-brand-blue text-text-primary text-sm font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Full Analysis →
              </button>
            </div>

            {/* Error message */}
            <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-status-error mb-1">Error</p>
              <p className="text-sm text-gray-300 font-mono">{selected.error_message || "Unknown error"}</p>
            </div>

            {/* Root cause if available */}
            {selected.root_cause && (
              <div className="bg-surface-2 border border-border rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Root Cause</p>
                  <span className="text-xs text-brand-blue">{Math.round((selected.confidence || 0) * 100)}% confidence</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{selected.root_cause}</p>
              </div>
            )}

            {/* AI tip */}
            <div className="bg-purple-900/20 border border-purple-500/25 rounded-xl p-4 mt-4">
              <p className="text-xs font-semibold text-purple-300 mb-1">✦ AI Tip</p>
              <p className="text-xs text-text-muted leading-relaxed">
                Click "Full Analysis" to see the complete incident timeline and apply an automated fix.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="relative mx-auto mb-6 w-24 h-24">
                <div className="w-24 h-24 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
                  <Search size={32} className="text-purple-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <Search size={12} className="text-text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No active investigation</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-6">
                Select a recent failure from the list or search above to start the root cause analysis. FlowLens AI will automatically map the event timeline and isolate the faulty node.
              </p>
              <div className="flex items-center justify-center gap-2 bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-xs text-text-muted">
                <span>Press</span>
                <kbd className="bg-surface border border-border rounded px-1.5 py-0.5 font-mono">⌘</kbd>
                <kbd className="bg-surface border border-border rounded px-1.5 py-0.5 font-mono">K</kbd>
                <span>to search</span>
              </div>

              {/* AI tip */}
              {incidents.length > 0 && (
                <div className="mt-6 bg-purple-900/20 border border-purple-500/25 rounded-xl p-4 text-left">
                  <p className="text-xs font-semibold text-purple-300 mb-1">✦ AI Tip</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {incidents.length} incident{incidents.length > 1 ? "s" : ""} detected. Select one from the list to begin investigation.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


