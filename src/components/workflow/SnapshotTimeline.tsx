// ─────────────────────────────────────────────────────────────
// src/components/workflow/SnapshotTimeline.tsx
// Left sidebar — historical record of execution states
// ─────────────────────────────────────────────────────────────

"use client";

interface Snapshot {
  id: string;
  created_at: string;
  source: string;
  execution_status: string | null;
  label?: string | null;
}

interface Props {
  snapshots: Snapshot[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const statusDot: Record<string, string> = {
  success: "bg-status-success",
  failure: "bg-status-error",
  unknown: "bg-gray-500",
};

export default function SnapshotTimeline({ snapshots, selectedId, onSelect }: Props) {
  return (
    <div className="w-64 border-r border-border bg-surface-2 h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Snapshot Timeline
        </h3>
      </div>
      <div className="p-2 space-y-1">
        {snapshots.map(s => {
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                isSelected
                  ? "bg-surface-3 border border-brand-orange/30"
                  : "hover:bg-surface-3/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[s.execution_status || "unknown"]}`} />
                <span className="text-xs text-text-muted font-medium">
                  {s.label || s.source}
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                {new Date(s.created_at).toLocaleString(undefined, {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </button>
          );
        })}
        {snapshots.length === 0 && (
          <p className="text-xs text-text-muted px-3 py-4">No snapshots yet.</p>
        )}
      </div>
    </div>
  );
}


