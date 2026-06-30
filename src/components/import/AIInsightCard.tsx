
// ─────────────────────────────────────────────────────────────
// src/components/import/AIInsightCard.tsx
// ─────────────────────────────────────────────────────────────

export default function AIInsightCard() {
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-purple-300 text-sm">◎</span>
        <span className="text-xs font-bold tracking-wide text-purple-300">AI INSIGHT</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">
        I can automatically refactor your n8n or Zapier flows for better observability.
        Just connect your account to begin.
      </p>
    </div>
  );
}


