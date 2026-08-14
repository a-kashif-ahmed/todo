// ─────────────────────────────────────────────────────────────
// src/components/workflow/AIInsightsPanel.tsx
// Right panel — AI understanding of the workflow, plus system health,
// dependencies, and recent changes.
// ─────────────────────────────────────────────────────────────

"use client";

import WorkflowDependencies from "./WorkflowDependencies";

interface Props {
  workflowName: string;
  latencyMs?: number;
  systemHealth: "healthy" | "degraded" | "failing" | "unknown";
  dependencies: string[];
  recentChanges: Array<{ label: string; time: string }>;
  aiSummary?: string;
  aiComplexity?: "low" | "medium" | "high";
  aiRisks?: string[];
  aiSummaryLoading?: boolean;
}

const healthStyle: Record<string, string> = {
  healthy: "text-status-success",
  degraded: "text-status-warning",
  failing: "text-status-error",
  unknown: "text-text-muted",
};

const complexityStyle: Record<string, string> = {
  low: "text-status-success border-status-success/30 bg-status-success/10",
  medium: "text-status-warning border-status-warning/30 bg-status-warning/10",
  high: "text-status-error border-status-error/30 bg-status-error/10",
};

export default function AIInsightsPanel({
  workflowName,
  latencyMs,
  systemHealth,
  dependencies,
  recentChanges,
  aiSummary,
  aiComplexity,
  aiRisks = [],
  aiSummaryLoading,
}: Props) {
  return (
    <div className="w-60 border-l border-border bg-surface-2 h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          AI Insights
        </h3>
      </div>

      <div className="p-4 space-y-5">

        {/* AI summary + complexity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">AI Summary</p>
            {aiComplexity && !aiSummaryLoading && (
              <span className={`text-[10px] font-medium uppercase border rounded-full px-2 py-0.5 ${complexityStyle[aiComplexity]}`}>
                {aiComplexity}
              </span>
            )}
          </div>
          {aiSummaryLoading ? (
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-surface-3 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-surface-3 rounded animate-pulse" />
            </div>
          ) : (
            <p className="text-xs text-text-muted leading-relaxed">
              {aiSummary || "No AI summary available yet."}
            </p>
          )}
        </div>

        {/* AI risks */}
        {!aiSummaryLoading && aiRisks.length > 0 && (
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">AI-Flagged Risks</p>
            <div className="space-y-1.5">
              {aiRisks.map((risk, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-status-warning">⚠</span>
                  <span className="text-text-muted leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System health */}
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">System Health</p>
          <div className="flex items-center justify-between bg-surface rounded-lg border border-border px-3 py-2.5">
            <span className={`text-sm font-medium ${healthStyle[systemHealth]}`}>
              {systemHealth}
            </span>
            {latencyMs !== undefined && (
              <span className="text-xs text-text-muted">{latencyMs}ms avg</span>
            )}
          </div>
        </div>

        {/* Dependencies */}
        <WorkflowDependencies dependencies={dependencies} />

        {/* Recent changes */}
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">Recent Changes</p>
          <div className="space-y-2">
            {recentChanges.length === 0 && (
              <span className="text-xs text-text-muted">No recent changes</span>
            )}
            {recentChanges.map((c, i) => (
              <div key={i} className="text-xs">
                <p className="text-text-muted">{c.label}</p>
                <p className="text-text-muted text-[11px]">{c.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className=" px-2 pb-3">
          
        </div>

      </div>
    </div>
  );
}
