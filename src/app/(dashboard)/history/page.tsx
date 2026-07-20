// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/history/page.tsx
// Figma: History — left timeline + right Builder Insights sidebar
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { GitBranch, RotateCcw, Upload, Zap, Clock } from "lucide-react";
import Link from "next/link";

interface HistoryEntry {
  id: string;
  workflow_id: string;
  action: string;
  actor_type: "user" | "system" | "ai";
  created_at: string;
  profiles?: { display_name: string };
}

function actionIcon(action: string) {
  if (action.includes("restore")) return <RotateCcw size={13} className="text-status-success" />;
  if (action.includes("import"))  return <Upload size={13} className="text-status-warning" />;
  if (action.includes("snapshot")) return <GitBranch size={13} className="text-brand-blue" />;
  return <Zap size={13} className="text-purple-400" />;
}

const actorBadge = {
  user:   "bg-brand-blue/15 text-brand-blue",
  system: "bg-gray-500/15 text-gray-400",
  ai:     "bg-purple-500/15 text-purple-300",
};

function groupByDate(entries: HistoryEntry[]) {
  return entries.reduce<Record<string, HistoryEntry[]>>((acc, e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const label = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
    (acc[label] = acc[label] || []).push(e);
    return acc;
  }, {});
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(data => { setHistory(data.history || []); setLoading(false); });
  }, []);

  const grouped = groupByDate(history);
  const isEmpty = !loading && history.length === 0;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Timeline ── */}
      <div className="flex-1 overflow-y-auto p-8 pr-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-2xl bg-surface-2 border border-dashed border-border flex items-center justify-center mb-6">
              <Clock size={32} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No activity tracked yet</h2>
            <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
              Once you start deploying workflows or making changes, your audit log will appear here for versioning and recovery.
            </p>
            <div className="flex gap-3">
              <Link href="/workflows" className="flex items-center gap-2 bg-brand-blue text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity">
                <GitBranch size={14} /> Go to Workflows
              </Link>
              <Link href="/import" className="flex items-center gap-2 bg-surface-2 border border-border text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:border-gray-500 transition-colors">
                Import JSON
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-white mb-6">History</h1>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : (
              <div className="space-y-8">
                {Object.entries(grouped).map(([date, entries]) => (
                  <div key={date}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{date}</p>
                    <div className="space-y-2">
                      {entries.map(entry => (
                        <Link
                          key={entry.id}
                          href={`/workflows/${entry.workflow_id}`}
                          className="flex items-center gap-4 bg-surface-2 border border-border rounded-xl px-4 py-3.5 hover:border-brand-blue/30 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                            {actionIcon(entry.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-white">
                                {entry.action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                              </p>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${actorBadge[entry.actor_type]}`}>
                                {entry.actor_type === "ai" ? "FlowLens AI" : entry.profiles?.display_name || "System"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.workflow_id}</p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── RIGHT: Builder Insights sidebar ── */}
      <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-purple-300">◎</span>
          <h2 className="text-base font-semibold text-white">Builder Insights</h2>
        </div>
        <p className="text-xs text-gray-500">Maximize your automation visibility</p>

        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <p className="text-[10px] font-bold text-brand-blue tracking-wider mb-2">✦ AUTO-VERSIONING</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Every single logic node update or trigger change is automatically snapshot. You can roll back to any point in time with 100% state persistence.
          </p>
        </div>

        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <p className="text-[10px] font-bold text-status-warning tracking-wider mb-2">◉ ANOMALY DETECTION</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            FlowLens AI constantly monitors your history to find patterns. If a workflow begins failing due to a logic loop, it will highlight the exact version where it started.
          </p>
        </div>

        {/* Version engine banner */}
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="bg-gradient-to-br from-surface-3 to-surface-2 h-24 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-1">⚙</div>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-white">Version Engine Active</p>
          </div>
        </div>

        {/* Recent system health */}
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent System Health</p>
          <div className="space-y-2">
            {[
              { label: "Log Engine", status: "Operational" },
              { label: "Auth Audit",  status: "Synchronized" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-brand-blue flex items-center justify-center flex-shrink-0">
                  <span className="w-1 h-1 rounded-full bg-brand-blue" />
                </span>
                <span className="text-xs text-gray-400">{item.label}: <span className="text-gray-300">{item.status}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

