// ─────────────────────────────────────────────────────────────
// src/components/ui/system-health-card/page.tsx
// AI-findings-focused replacement for the old plain uptime card.
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";

interface Workflow {
  id: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
  latest_ai_summary?: { risks: string[]; optimization_opportunities: string[] } | null;
  latest_ai_review?: { findings: any[] } | null;
}

export default function SystemHealthCard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workflows")
      .then(r => r.json())
      .then(data => { setWorkflows(data.workflows || []); setLoading(false); });
  }, []);

  const findingsCount = workflows.reduce((sum, w) => sum + (w.latest_ai_review?.findings?.length || 0), 0);
  const risksCount = workflows.reduce((sum, w) => sum + (w.latest_ai_summary?.risks.length || 0), 0);
  const optimizationsCount = workflows.reduce(
    (sum, w) => sum + (w.latest_ai_summary?.optimization_opportunities.length || 0),
    0
  );
  const needingAttention = workflows.filter(w => w.status === "failing" || w.status === "degraded").length;

  return (
    <div className="m-5 flex flex-col rounded-lg border border-border bg-surface-2 p-6 shadow-xs transition-colors hover:bg-surface-3">
      <h2 className="mb-3 text-xl font-semibold text-text-primary">AI FINDINGS</h2>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 w-2/3 bg-surface-3 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-surface-3 rounded animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-brand-orange">{findingsCount}</p>
            <p className="text-text-muted text-xs">review findings</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${needingAttention > 0 ? "text-status-error" : "text-status-success"}`}>
              {needingAttention}
            </p>
            <p className="text-text-muted text-xs">need attention</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${risksCount > 0 ? "text-amber-400" : "text-status-success"}`}>{risksCount}</p>
            <p className="text-text-muted text-xs">deployment risks</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{optimizationsCount}</p>
            <p className="text-text-muted text-xs">optimizations found</p>
          </div>
        </div>
      )}

      <div className="border-b-2 border-brand-orange mt-4" />
    </div>
  );
}
