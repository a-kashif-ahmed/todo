// ─────────────────────────────────────────────────────────────
// src/components/diff/AIExplanationCard.tsx
// ─────────────────────────────────────────────────────────────

"use client";

interface SuggestedFix {
  description: string;
  node_id?: string;
  field?: string;
}

interface Props {
  rootCause: string;
  confidence: number;
  impactSummary: string;
  suggestedFix: SuggestedFix | null;
  onApplyFix?: () => void;
  applying?: boolean;
}

export default function AIExplanationCard({
  rootCause,
  confidence,
  impactSummary,
  suggestedFix,
  onApplyFix,
  applying,
}: Props) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">AI Explanation</h3>
        <span className="text-xs text-gray-500">
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        {rootCause}
      </p>

      <div className="bg-surface rounded-lg border border-border-light px-3 py-2.5 mb-4">
        <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Impact</p>
        <p className="text-xs text-gray-400 leading-relaxed">{impactSummary}</p>
      </div>

      {suggestedFix && (
        <div className="flex items-center justify-between bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-3 py-2.5">
          <p className="text-xs text-brand-blue flex-1 mr-3">
            {suggestedFix.description}
          </p>
          {onApplyFix && (
            <button
              onClick={onApplyFix}
              disabled={applying}
              className="text-xs font-medium bg-brand-blue text-white rounded px-3 py-1.5 whitespace-nowrap disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              {applying ? "Applying..." : "Apply Fix"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}


