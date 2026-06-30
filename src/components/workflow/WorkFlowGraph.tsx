// ============================================================
// WORKFLOW DETAIL PAGE — the toughest piece
// Copy each block to its file path
// ============================================================

// ─────────────────────────────────────────────────────────────
// src/components/workflow/WorkflowGraph.tsx
// ─────────────────────────────────────────────────────────────

"use client";
import ReactFlow, { Node, Edge, Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import type { NormalisedWorkFlow, WorkflowDiff } from "@/types/flowlens";

const statusColor: Record<string, string> = {
  added: "#22c55e",
  removed: "#ef4444",
  modified: "#f59e0b",
  unchanged: "#30363d",
};

interface Props {
  workflow: NormalisedWorkFlow;
  diff?: WorkflowDiff;
  height?: number;
}

export default function WorkflowGraph({ workflow, diff, height = 460 }: Props) {
  const diffMap = new Map(diff?.nodes.map(n => [n.nodeId, n.status]) || []);

  const nodes: Node[] = workflow.nodes.map((n, i) => ({
    id: n.id,
    position: n.position || { x: (i % 4) * 220, y: Math.floor(i / 4) * 140 },
    data: { label: n.label },
    style: {
      background: "#161b22",
      border: `1.5px solid ${statusColor[diffMap.get(n.id) || "unchanged"]}`,
      borderRadius: 8,
      color: "#e6edf3",
      fontSize: 12,
      padding: "10px 16px",
      minWidth: 130,
    },
  }));

  const edges: Edge[] = workflow.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: { stroke: "#30363d", strokeWidth: 1.5 },
    animated: false,
  }));

  return (
    <div style={{ height, background: "#0d1117", borderRadius: 10, overflow: "hidden" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background color="#1c2230" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}


