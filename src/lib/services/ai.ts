// src/lib/services/ai.ts
// Uses OpenRouter API — drop-in compatible with OpenAI SDK format

import { WorkflowDiff } from "@/types/flowlens";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MODEL = "google/gemini-2.0-flash";

// ── Helper: base fetch with auth headers ─────────────────────────────────────
function openRouterHeaders() {
  return {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "FlowLens",
  };
}

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

  const prompt = `You are a workflow automation debugging expert.
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
        response_format: { type: "json_object" }, // force JSON output
      }),
    });

    if (!res.ok) {
      const err = await res.text();
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

// ── Streaming chat (for AI assistant) ───────────────────────────────────────
// Returns a raw Response with SSE stream — pass directly to route handler
export async function createChatStream(
  messages: ChatMessage[],
  context: string
): Promise<Response> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: `You are FlowLens AI, a workflow automation debugging assistant.
Be concise and specific. Reference node names and field names when explaining issues.
${context}`,
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