// ============================================================
// AI ASSISTANT OVERLAY
// Copy each block to its file path
// ============================================================

// ─────────────────────────────────────────────────────────────
// src/components/assistant/IncidentBanner.tsx
// Floating banner shown on the graph behind the chat panel
// ─────────────────────────────────────────────────────────────

interface Props {
  incidentId: string;
  statusLabel: string;
}

export default function IncidentBanner({ incidentId, statusLabel }: Props) {
  return (
    <div className="absolute top-6 left-6 bg-surface-2 border border-status-error/30 rounded-xl px-5 py-3.5 max-w-xs">
      <p className="text-sm font-semibold text-status-error">Incident: {incidentId}</p>
      <p className="text-xs text-text-muted mt-0.5">{statusLabel}</p>
      <p className="text-[11px] text-gray-600 mt-2">Just now</p>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────
// USAGE EXAMPLE — how to drop this into the workflow detail page
// Add this inside src/app/(dashboard)/workflows/[id]/page.tsx
// ─────────────────────────────────────────────────────────────

/*
import { useState } from "react";
import AIAssistantPanel from "@/components/assistant/AIAssistantPanel";

// Inside your component:
const [assistantOpen, setAssistantOpen] = useState(false);

// Add a trigger button somewhere in your header:
<button
  onClick={() => setAssistantOpen(true)}
  className="text-xs bg-surface-2 border border-border rounded-lg px-4 py-2 text-gray-300 hover:text-text-primary hover:border-brand-orange/40 transition-colors"
>
  Ask AI Assistant
</button>

// Render the panel conditionally:
{assistantOpen && (
  <AIAssistantPanel
    workflowId={workflowId}
    incidentContext={`Workflow: ${workflow?.name}. Status: ${workflow?.status}.`}
    onClose={() => setAssistantOpen(false)}
    onApplyFix={async () => {
      // call your real fix-apply logic here
    }}
    onRestore={async () => {
      // call /api/snapshots/restore here
    }}
    onOpenCompare={() => {
      router.push(`/workflows/${workflowId}/compare?from=X&to=Y`);
    }}
  />
)}
*/