

// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/workflows/[id]/page.tsx
// Main workflow detail page — wires everything together
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import type { NormalisedWorkFlow } from "@/types/flowlens";

const WorkflowGraph = dynamic(() => import("@/components/workflow/WorkFlowGraph"), { ssr: false });

import SnapshotTimeline from "@/components/workflow/SnapshotTimeline";
import AIInsightsPanel from "@/components/workflow/AIInsightsPanel";

interface Snapshot {
  id: string;
  created_at: string;
  source: string;
  execution_status: string | null;
  label?: string | null;
}

interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("");
  const [normalisedData, setNormalisedData] = useState<NormalisedWorkFlow | null>(null);
  const [loading, setLoading] = useState(true);

  // Load workflow + snapshots on mount
  useEffect(() => {
    async function load() {
      const [wfRes, snapRes] = await Promise.all([
        fetch(`/api/workflows/${workflowId}`).then(r => r.json()),
        fetch(`/api/snapshots?workflow_id=${workflowId}`).then(r => r.json()),
      ]);
      setWorkflow(wfRes.workflow);
      setSnapshots(snapRes.snapshots || []);
      if (snapRes.snapshots?.length > 0) {
        setSelectedSnapshotId(snapRes.snapshots[0].id);
      }
      setLoading(false);
    }
    load();
  }, [workflowId]);

  // Load normalised graph data whenever selected snapshot changes
  useEffect(() => {
    if (!selectedSnapshotId) return;
    fetch(`/api/snapshots/${selectedSnapshotId}`)
      .then(r => r.json())
      .then(data => setNormalisedData(data.snapshot?.normalised || null));
  }, [selectedSnapshotId]);

  const dependencies = normalisedData
    ? Array.from(new Set(
        normalisedData.nodes
          .map(n => n.credential_ref)
          .filter(Boolean) as string[]
      ))
    : [];

  const recentChanges = snapshots.slice(0, 4).map(s => ({
    label: s.label || `${s.source} snapshot`,
    time: new Date(s.created_at).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }),
  }));

  if (loading) {
    return <div className="p-8 text-text-muted text-sm">Loading workflow...</div>;
  }

  if (!workflow) {
    return <div className="p-8 text-status-error text-sm">Workflow not found.</div>;
  }

  return (
    <div className="flex h-full">

      {/* Timeline sidebar */}
      <SnapshotTimeline
        snapshots={snapshots}
        selectedId={selectedSnapshotId}
        onSelect={setSelectedSnapshotId}
      />

      {/* Main graph area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{workflow.name}</h1>
            <p className="text-xs text-text-muted mt-0.5">
              {workflow.platform} · {snapshots.length} snapshots
            </p>
          </div>
          <a
            href={`/workflows/${workflowId}/compare?from=${snapshots[1]?.id || ""}&to=${selectedSnapshotId}`}
            className="text-xs bg-surface-2 border border-border rounded-lg px-4 py-2 text-gray-300 hover:text-text-primary hover:border-brand-orange/40 transition-colors"
          >
            Compare versions
          </a>
        </div>

        {normalisedData ? (
          <WorkflowGraph workflow={normalisedData} />
        ) : (
          <div className="h-96 flex items-center justify-center text-text-muted text-sm bg-surface-2 rounded-lg border border-border">
            No snapshot data available
          </div>
        )}
      </div>

      {/* AI Insights panel */}
      <AIInsightsPanel
        workflowName={workflow.name}
        systemHealth={workflow.status}
        latencyMs={142}
        dependencies={dependencies}
        recentChanges={recentChanges}
      />

    </div>
  );
}