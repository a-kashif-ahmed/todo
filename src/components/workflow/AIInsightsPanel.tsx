// ─────────────────────────────────────────────────────────────
// src/components/workflow/AIInsightsPanel.tsx
// Right panel — real-time node logic + performance metrics
// ─────────────────────────────────────────────────────────────

"use client";

interface Props {
  workflowName: string;
  latencyMs?: number;
  systemHealth: "healthy" | "degraded" | "failing" | "unknown";
  dependencies: string[];
  recentChanges: Array<{ label: string; time: string }>;
}

const healthStyle: Record<string, string> = {
  healthy: "text-status-success",
  degraded: "text-status-warning",
  failing: "text-status-error",
  unknown: "text-text-muted",
};

export default function AIInsightsPanel({
  workflowName,
  latencyMs,
  systemHealth,
  dependencies,
  recentChanges,
}: Props) {
  return (
    <div className="w-72 border-l border-border bg-surface-2 h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          AI Insights
        </h3>
      </div>

      <div className="p-4 space-y-5">

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
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">Upstream Dependencies</p>
          <div className="flex flex-wrap gap-1.5">
            {dependencies.length === 0 && (
              <span className="text-xs text-text-muted">None detected</span>
            )}
            {dependencies.map(dep => (
              <span
                key={dep}
                className="text-[11px] bg-surface border border-border rounded px-2 py-1 text-text-muted"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>

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

      </div>
    </div>
  );
}


