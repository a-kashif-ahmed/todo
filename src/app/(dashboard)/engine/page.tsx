
// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/engine/page.tsx
// Figma: AI Engine Status — left metrics + right engine card
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import AIEngineStatus from "@/components/engine/AIEngineStatus";


interface Incident { id: string; workflow_id: string; error_message: string | null; detected_at: string; }
interface Workflow  { id: string; name: string; }

export default function AIEngineStatusPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, string>>({});
  const [successRate, setSuccessRate] = useState(0);
  const [totalNodes, setTotalNodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [incRes, wfRes, snapRes] = await Promise.all([
        fetch("/api/incidents?status=open").then(r => r.json()),
        fetch("/api/workflows").then(r => r.json()),
        fetch("/api/snapshots").then(r => r.json()),
      ]);
      setIncidents(incRes.incidents || []);
      const map: Record<string, string> = {};
      const wfs: Workflow[] = wfRes.workflows || [];
      wfs.forEach(w => { map[w.id] = w.name; });
      setWorkflows(map);

      const snaps = snapRes.snapshots || [];
      const success = snaps.filter((s: any) => s.execution_status === "success").length;
      const total = snaps.length || 1;
      setSuccessRate(Math.round((success / total) * 1000) / 10);

      // Count total nodes across all snapshots
      let nodes = 0;
      snaps.forEach((s: any) => { nodes += s.normalised?.nodes?.length || 0; });
      setTotalNodes(nodes);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: System performance ── */}
      <div className="flex-1 overflow-y-auto p-8 pr-6">
        <h1 className="text-3xl font-bold text-text-primary mb-1">System Performance</h1>
        <p className="text-sm text-text-muted mb-8">Real-time health monitoring of all automation clusters.</p>

        {/* Big metrics */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Success Rate</p>
            <p className="text-5xl font-bold text-text-primary mb-1">{loading ? "—" : `${successRate}%`}</p>
            <p className="text-xs text-status-success flex items-center gap-1">↑ +0.4% from yesterday</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Active Nodes</p>
            <p className="text-5xl font-bold text-text-primary mb-1">{loading ? "—" : totalNodes.toLocaleString()}</p>
            <p className="text-xs text-text-muted flex items-center gap-1">⬡ Across all workflows</p>
          </div>
        </div>

        {/* Active Logic Canvas placeholder */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-text-muted mb-4">Active Logic Canvas</p>
          <div className="bg-surface-2 border border-border rounded-xl h-48 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-6 opacity-40">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    {i < 3 && <div className="w-16 h-px bg-dashed border-t border-gray-600 border-dashed" />}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600 z-10">Live graph rendering...</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: AI Engine card ── */}
      <div className="w-80 flex-shrink-0 border-l border-border overflow-y-auto p-6">
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">⚡</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">AI Engine</p>
                  <span className="text-[10px] font-bold bg-status-success/15 text-status-success border border-status-success/25 rounded-full px-2 py-0.5">● LIVE</span>
                </div>
                <p className="text-[11px] text-text-muted">Actively monitoring {totalNodes} active workflows</p>
              </div>
            </div>
            <button className="text-text-muted hover:text-text-primary">⋯</button>
          </div>

          {/* AI Confidence */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">AI Confidence</p>
              <span className="text-sm font-bold text-brand-blue">98.4%</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 h-6 rounded-sm" style={{ background: i >= 10 ? "#3b82f6" : "#1c2230", opacity: 0.5 + i * 0.04 }} />
              ))}
            </div>
          </div>

          {/* Recent detections */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Recent Detections</p>
            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-text-muted">Loading...</p>
              ) : incidents.slice(0, 2).map(inc => (
                <button
                  key={inc.id}
                  onClick={() => router.push(`/workflows/${inc.workflow_id}/incidents/${inc.id}`)}
                  className="w-full flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2.5 hover:border-brand-blue/30 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded bg-surface-2 flex items-center justify-center text-[10px]">⬡</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{workflows[inc.workflow_id] || "Unknown workflow"}</p>
                    <p className="text-[10px] text-text-muted">
                      {new Date(inc.detected_at).toLocaleTimeString()} · Critical Path
                    </p>
                  </div>
                  <span className="text-text-muted">›</span>
                </button>
              ))}
              {!loading && incidents.length === 0 && (
                <p className="text-xs text-status-success flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success" /> All systems healthy
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 space-y-2">
            <button
              onClick={() => router.push("/assistant")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-text-primary font-semibold text-sm rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              ◎ Open AI Assistant
            </button>
            <button
              onClick={() => router.push("/investigate")}
              className="w-full bg-surface border border-border text-text-primary font-medium text-sm rounded-xl py-3 hover:border-gray-500 transition-colors"
            >
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}