import { NormalisedWorkFlow, FlowNode, FlowEdge } from "@/types/flowlens";

function stripCredentials(config: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...config };
  ["apiKey", "token", "password", "secret", "credentials", "accessToken"]
    .forEach(k => { if (k in safe) safe[k] = "[REDACTED]"; });
  return safe;
}

// Auto-layout when nodes have no position data
function autoLayout(index: number): { x: number; y: number } {
  const cols = 4;
  return {
    x: (index % cols) * 220,
    y: Math.floor(index / cols) * 140,
  };
}

function normaliseN8n(raw: Record<string, unknown>): NormalisedWorkFlow {
  // Validation
  if (!raw.nodes || !Array.isArray(raw.nodes)) {
    throw new Error("Invalid n8n workflow: missing nodes array");
  }
  if (!raw.connections || typeof raw.connections !== "object") {
    throw new Error("Invalid n8n workflow: missing connections object");
  }

  const rawNodes = (raw.nodes as any[]) || [];

  const nodes: FlowNode[] = rawNodes.map((n, index) => ({
    id: n.id,
    type: n.type,
    label: n.name || n.type,
    config: stripCredentials(n.parameters || {}),
    credential_ref: n.credentials
      ? Object.keys(n.credentials)[0]
      : undefined,
    position: n.position
      ? { x: n.position[0], y: n.position[1] }
      : autoLayout(index), // fallback layout
  }));

  const connections = (raw.connections as any) || {};
  const edges: FlowEdge[] = [];

  Object.entries(connections).forEach(([sourceLabel, targets]: [string, any]) => {
    const sourceNode = nodes.find(n => n.label === sourceLabel);
    if (!sourceNode) return;

    // Handle main connections
    (targets.main || []).forEach((outputs: any[]) => {
      outputs.forEach((conn: any) => {
        const targetNode = nodes.find(n => n.label === conn.node);
        if (targetNode) edges.push({
          id: `${sourceNode.id}->${targetNode.id}`,
          source: sourceNode.id,
          target: targetNode.id,
        });
      });
    });

    // Handle ai_tool connections (n8n AI agent nodes)
    (targets.ai_tool || []).forEach((outputs: any[]) => {
      outputs.forEach((conn: any) => {
        const targetNode = nodes.find(n => n.label === conn.node);
        if (targetNode) edges.push({
          id: `${sourceNode.id}-ai->${targetNode.id}`,
          source: sourceNode.id,
          target: targetNode.id,
          label: "ai_tool",
        });
      });
    });
  });

  return {
    nodes,
    edges,
    meta: {
      platform: "n8n",
      name: (raw.name as string) || "Unnamed",
      version: raw.versionId as string,
    },
  };
}

export function detectPlatform(raw: Record<string, unknown>): string {
  if (Array.isArray(raw.nodes) && raw.connections) return "n8n";
  if (Array.isArray((raw as any).steps) && (raw as any).title) return "zapier";
  if (Array.isArray((raw as any).flow) && (raw as any).metadata) return "make";
  return "unknown";
}

export function normalise(
  platform: string,
  raw: Record<string, unknown>
): NormalisedWorkFlow {
  switch (platform) {
    case "n8n": return normaliseN8n(raw);
    default: throw new Error(`Unsupported platform: ${platform}`);
  }
}