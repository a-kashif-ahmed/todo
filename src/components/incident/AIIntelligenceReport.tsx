// ─────────────────────────────────────────────────────────────
// src/components/incident/AIIntelligenceReport.tsx
// ─────────────────────────────────────────────────────────────

"use client";

interface RecommendedAction {
  icon: "fix" | "rollback";
  title: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
}

interface Props {
  rootCause: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  explanation: string;
  actions: RecommendedAction[];
  onApplyFix: () => void;
  onRestore: () => void;
  applyingFix?: boolean;
  restoring?: boolean;
}

const impactStyle: Record<string, string> = {
  low: "bg-status-success/15 text-status-success",
  medium: "bg-amber-400/15 text-amber-400",
  high: "bg-status-error/15 text-status-error",
};

const actionIcon: Record<string, string> = {
  fix: "✨",
  rollback: "↺",
};

export default function AIIntelligenceReport({
  rootCause,
  confidence,
  impact,
  explanation,
  actions,
  onApplyFix,
  onRestore,
  applyingFix,
  restoring,
}: Props) {
  return (
    <div className="w-full">
      {/* Header badge */}
      <div className="flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-lg px-3.5 py-2 mb-5 w-fit">
        <span className="text-purple-300">◎</span>
        <span className="text-xs font-bold tracking-wider text-purple-300">
          AI INTELLIGENCE REPORT
        </span>
      </div>

      {/* Root cause card */}
      <div className="bg-surface-2 border border-border rounded-xl p-5 mb-5">
        <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase mb-2">
          Root Cause Identified
        </p>
        <h2 className="text-xl font-semibold text-white mb-4 leading-snug">
          '{rootCause}'
        </h2>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-blue rounded-full"
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-brand-blue">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Impact</span>
          <span
            className={`text-[11px] font-bold tracking-wide rounded px-2.5 py-1 ${impactStyle[impact]}`}
          >
            {impact.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed italic">
          "{explanation}"
        </p>
      </div>

      {/* Recommended actions */}
      <p className="text-sm font-semibold text-white mb-3">Recommended Actions</p>
      <div className="space-y-2 mb-5">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.loading}
            className="w-full flex items-start gap-3 bg-surface-2 border border-border rounded-xl p-4 text-left hover:border-brand-blue/30 transition-colors disabled:opacity-60"
          >
            <span className="w-9 h-9 rounded-lg bg-surface-3 border border-border flex items-center justify-center text-base flex-shrink-0">
              {actionIcon[action.icon]}
            </span>
            <div>
              <p className="text-sm font-medium text-white">{action.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Primary actions */}
      <button
        onClick={onApplyFix}
        disabled={applyingFix}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl py-3.5 mb-3 transition-colors disabled:opacity-60"
      >
        {applyingFix ? "Applying Fix..." : "Apply Fix"}
      </button>
      <button
        onClick={onRestore}
        disabled={restoring}
        className="w-full bg-surface-2 border border-border text-white font-semibold rounded-xl py-3.5 hover:border-gray-500 transition-colors disabled:opacity-60"
      >
        {restoring ? "Restoring..." : "Restore Yesterday's State"}
      </button>
    </div>
  );
}


