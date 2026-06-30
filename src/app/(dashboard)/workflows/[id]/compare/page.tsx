// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/workflows/[id]/compare/page.tsx
// Main visual compare page — wires everything together
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { WorkflowDiff, NormalisedWorkFlow } from "@/types/flowlens";

const WorkflowGraph = dynamic(() => import("@/components/workflow/WorkFlowGraph"), { ssr: false });

import DiffLegend from "@/components/diff/DiffLegend";
import AIExplanationCard from "@/components/diff/AIExplanationCard";
import RecoveryControls from "@/components/diff/RecoveryControls";

interface Analysis {
  root_cause: string;
  confidence: number;
  impact_summary: string;
  suggested_fix: { description: string; node_id?: string; field?: string } | null;
}

// src/app/(dashboard)/workflows/[id]/compare/page.tsx
import { Suspense } from "react";

export default function ComparePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Loading...</div>}>
      <ComparePage />
    </Suspense>
  );
}
function ComparePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const workflowId = params.id as string;
  const fromId = searchParams.get("from");
  const toId = searchParams.get("to");

  const [diff, setDiff] = useState<WorkflowDiff | null>(null);
  const [snapBefore, setSnapBefore] = useState<NormalisedWorkFlow | null>(null);
  const [snapAfter, setSnapAfter] = useState<NormalisedWorkFlow | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoredMessage, setRestoredMessage] = useState("");
  const [applyingFix, setApplyingFix] = useState(false);

  useEffect(() => {
    if (!fromId || !toId) {
      setError("Missing snapshot IDs to compare.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [diffRes, snapARes, snapBRes] = await Promise.all([
          fetch(`/api/diff?from=${fromId}&to=${toId}`).then(r => r.json()),
          fetch(`/api/snapshots/${fromId}`).then(r => r.json()),
          fetch(`/api/snapshots/${toId}`).then(r => r.json()),
        ]);

        if (diffRes.error) throw new Error(diffRes.error);

        setDiff(diffRes.diff);
        setSnapBefore(snapARes.snapshot?.normalised || null);
        setSnapAfter(snapBRes.snapshot?.normalised || null);

        // Find or trigger AI analysis — look for an incident linking these snapshots
        const incidentsRes = await fetch(
          `/api/incidents?workflow_id=${workflowId}&status=open`
        ).then(r => r.json());

        const matchingIncident = incidentsRes.incidents?.find(
          (inc: any) => inc.snapshot_before === fromId && inc.snapshot_after === toId
        );

        if (matchingIncident) {
          const analyseRes = await fetch(
            `/api/incidents/${matchingIncident.id}/analyse`,
            { method: "POST" }
          ).then(r => r.json());
          setAnalysis(analyseRes.analysis);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load comparison");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fromId, toId, workflowId]);

  async function handleRestore() {
    if (!fromId) return;
    setRestoring(true);
    try {
      await fetch("/api/snapshots/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: fromId, workflow_id: workflowId }),
      });
      setRestoredMessage("Workflow restored to last working version.");
      setTimeout(() => router.push(`/workflows/${workflowId}`), 1500);
    } catch {
      setError("Restore failed. Try again.");
    } finally {
      setRestoring(false);
    }
  }

  async function handleApplyFix() {
    setApplyingFix(true);
    // MVP: applying a fix just marks the incident resolved.
    // Full auto-patch logic comes in a later phase.
    setTimeout(() => setApplyingFix(false), 1200);
  }

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">Loading comparison...</div>;
  }

  if (error) {
    return <div className="p-8 text-status-error text-sm">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-white">Visual Compare</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Last working version vs current broken version
          </p>
        </div>
        <DiffLegend />
      </div>

      {/* Split graphs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Last working</p>
          {snapBefore ? (
            <WorkflowGraph workflow={snapBefore} diff={diff!} height={380} />
          ) : (
            <div className="h-[380px] bg-surface-2 rounded-lg border border-border flex items-center justify-center text-gray-500 text-sm">
              No data
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Current (broken)</p>
          {snapAfter ? (
            <WorkflowGraph workflow={snapAfter} diff={diff!} height={380} />
          ) : (
            <div className="h-[380px] bg-surface-2 rounded-lg border border-border flex items-center justify-center text-gray-500 text-sm">
              No data
            </div>
          )}
        </div>
      </div>

      {/* Diff summary strip */}
      {diff && (
        <div className="flex items-center gap-6 bg-surface-2 border border-border rounded-lg px-4 py-3 mb-6 text-xs">
          <span className="text-status-success">{diff.summary.added} added</span>
          <span className="text-status-warning">{diff.summary.modified} modified</span>
          <span className="text-status-error">{diff.summary.removed} removed</span>
          {diff.edgesChanged && <span className="text-gray-400">Connections changed</span>}
        </div>
      )}

      {/* AI explanation */}
      {analysis ? (
        <div className="mb-6">
          <AIExplanationCard
            rootCause={analysis.root_cause}
            confidence={analysis.confidence}
            impactSummary={analysis.impact_summary}
            suggestedFix={analysis.suggested_fix}
            onApplyFix={analysis.suggested_fix ? handleApplyFix : undefined}
            applying={applyingFix}
          />
        </div>
      ) : (
        <div className="bg-surface-2 border border-border rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-500">
            No AI analysis available for this comparison. This usually means no incident
            is linked to these snapshots yet.
          </p>
        </div>
      )}

      {/* Recovery controls */}
      <RecoveryControls
        onRestore={handleRestore}
        restoring={restoring}
        restoredMessage={restoredMessage}
      />

    </div>
  );
}