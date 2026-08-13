// src/lib/services/ai.ts
// AI Workflow Copilot service layer — understands, reviews, documents,
// optimises and helps deploy workflows (not just root-cause debugging).
// Uses OpenRouter-compatible API — drop-in compatible with OpenAI SDK format

import { NormalisedWorkFlow, WorkflowDiff } from "@/types/flowlens";

const OPENROUTER_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";
const MODEL = "gemini-2.0-flash";

function openRouterHeaders() {
  return {
    "Authorization": `Bearer ${process.env.GOOGLE_AI_KEY}`,
    "Content-Type": "application/json",
  };
}

// Shared persona used across every Copilot-facing prompt so tone stays
// consistent whether the user is debugging, reviewing, or asking "what
// does this workflow do".
const COPILOT_PERSONA = `You are FlowLens Copilot, an AI Workflow Copilot for automation platforms
(n8n, Zapier, Make). You help people understand, review, document, optimise
and safely deploy their automations — not just debug failures. Be concise,
specific, and reference node names and field names when you can.`;

// ── Types ────────────────────────────────────────────────────────────────────
export interface RootCauseAnalysis {
  root_cause: string;
  confidence: number;
  impact_summary: string;
  affected_nodes: string[];
  suggested_fix: {
    description: string;
    node_id?: string;
    field?: string;
  } | null;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface WorkflowSummary {
  summary: string;
  complexity: "low" | "medium" | "high";
  node_count: number;
  risks: string[];
  optimization_opportunities: string[];
}

// ── Root cause analysis (non-streaming) ─────────────────────────────────────
export async function analyseRootCause(
  diff: WorkflowDiff,
  errorMessage?: string
): Promise<RootCauseAnalysis> {
  // Early return — no changes means external failure
  if (
    diff.summary.added === 0 &&
    diff.summary.removed === 0 &&
    diff.summary.modified === 0
  ) {
    return {
      root_cause: "No structural changes detected between snapshots.",
      confidence: 1,
      impact_summary:
        "The failure may be caused by external factors such as API downtime or credential expiry.",
      affected_nodes: [],
      suggested_fix: null,
    };
  }

  const changedNodes = diff.nodes.filter(n => n.status !== "unchanged");

  const prompt = `${COPILOT_PERSONA}
A workflow diff has been detected. Identify the root cause of failure.

DIFF SUMMARY: ${diff.summary.added} added, ${diff.summary.removed} removed, ${diff.summary.modified} modified nodes.

CHANGED NODES:
${JSON.stringify(changedNodes, null, 2)}

${errorMessage ? `EXECUTION ERROR:\n${errorMessage}` : ""}

Respond ONLY with valid JSON matching this schema exactly. No markdown. No explanation. JSON only:
{
  "root_cause": "one sentence: what broke and why",
  "confidence": 0.85,
  "impact_summary": "what downstream nodes/systems are affected",
  "affected_nodes": ["node_id_here"],
  "suggested_fix": {
    "description": "plain language fix instruction",
    "node_id": "which node to fix",
    "field": "which field to change"
  }
}`;

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: openRouterHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
        
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenRouter bad request:", res.status, err);
      throw new Error(`OpenRouter error: ${err}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    return JSON.parse(text) as RootCauseAnalysis;
  } catch (e) {
    console.error("analyseRootCause failed:", e);
    return {
      root_cause: "Unable to determine root cause automatically.",
      confidence: 0,
      impact_summary: "Manual investigation required.",
      affected_nodes: [],
      suggested_fix: null,
    };
  }
}

// ── Workflow summary + complexity score ─────────────────────────────────────
// Used right after import and on the workflow detail page so the person sees
// an AI understanding of the workflow, not just a raw node/edge graph.
export async function generateWorkflowSummary(
  workflow: NormalisedWorkFlow
): Promise<WorkflowSummary> {
  const nodeCount = workflow.nodes.length;

  const prompt = `${COPILOT_PERSONA}
Analyse this automation workflow and produce a plain-language summary, a
complexity rating, any deployment/reliability risks you notice (e.g. missing
retries, single points of failure, unguarded external calls), and any
optimisation opportunities (e.g. redundant steps, missing error branches).

PLATFORM: ${workflow.meta?.platform || "unknown"}
NODES (${nodeCount}):
${JSON.stringify(workflow.nodes.map(n => ({ id: n.id, type: n.type, label: n.label })), null, 2)}

EDGES:
${JSON.stringify(workflow.edges, null, 2)}

Respond ONLY with valid JSON matching this schema exactly. No markdown. JSON only:
{
  "summary": "2-3 sentence plain-language description of what this workflow does",
  "complexity": "low | medium | high",
  "risks": ["short risk statement", "..."],
  "optimization_opportunities": ["short suggestion", "..."]
}`;

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: openRouterHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenRouter bad request:", res.status, err);
      throw new Error(`OpenRouter error: ${err}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || "No summary available.",
      complexity: parsed.complexity || "medium",
      node_count: nodeCount,
      risks: parsed.risks || [],
      optimization_opportunities: parsed.optimization_opportunities || [],
    };
  } catch (e) {
    console.error("generateWorkflowSummary failed:", e);
    return {
      summary: "AI summary is unavailable right now.",
      complexity: "medium",
      node_count: nodeCount,
      risks: [],
      optimization_opportunities: [],
    };
  }
}

// ── Semantic diff explanation ───────────────────────────────────────────────
// Turns a raw node-level diff ("Node A changed from X to Y") into a plain
// English explanation of what the change actually does and why it matters.
export async function explainChange(diff: WorkflowDiff): Promise<string> {
  if (diff.summary.added === 0 && diff.summary.removed === 0 && diff.summary.modified === 0) {
    return "No structural changes between these two snapshots.";
  }

  const changedNodes = diff.nodes.filter(n => n.status !== "unchanged");

  const prompt = `${COPILOT_PERSONA}
Explain, in 2-4 sentences of plain English, what changed between these two
workflow snapshots and why it matters (e.g. reliability, cost, correctness).
Do not just restate the diff — interpret its impact.

CHANGED NODES:
${JSON.stringify(changedNodes, null, 2)}
EDGES CHANGED: ${diff.edgesChanged}

Respond with plain text only. No markdown, no JSON.`;

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: openRouterHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`OpenRouter error: ${await res.text()}`);

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "AI explanation unavailable.";
  } catch (e) {
    console.error("explainChange failed:", e);
    return "AI explanation is unavailable right now — see the raw diff below.";
  }
}

// ── Streaming chat (Copilot) ─────────────────────────────────────────────────
// Returns a raw Response with SSE stream — pass directly to route handler
export async function createChatStream(
  messages: ChatMessage[],
  context: string
): Promise<Response> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: `${COPILOT_PERSONA}
You can help with: explaining what a workflow does, reviewing recent changes,
diagnosing failures, suggesting optimisations, checking deployment readiness,
and drafting documentation. If the person's question doesn't match the
context below, say so rather than guessing.

WORKFLOW CONTEXT:
${context || "No workflow context provided."}`,
  };

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: openRouterHeaders(),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      stream: true,
      messages: [systemMessage, ...messages],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter stream error: ${res.statusText}`);
  }

  // Transform OpenRouter SSE → FlowLens SSE format
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}