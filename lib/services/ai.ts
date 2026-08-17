// src/lib/services/ai.ts
// AI Workflow Copilot service layer — understands, reviews, documents,
// optimises and helps deploy workflows (not just root-cause debugging).
// Uses OpenRouter-compatible API — drop-in compatible with OpenAI SDK format

import { NormalisedWorkFlow, WorkflowDiff } from "@/types/flowlens";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MODEL = "google/gemma-4-26b-a4b-it:free";

function openRouterHeaders() {
  return {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  };
}

// Shared helper — calls the model and parses a JSON response, with a
// consistent error shape so every endpoint fails the same safe way.
async function callJSON<T>(prompt: string, maxTokens: number, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: openRouterHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
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
    return JSON.parse(text) as T;
  } catch (e) {
    console.error("callJSON failed:", e);
    return fallback;
  }
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
  // Original fields — kept stable because they map directly to existing
  // `flowlens_incidents` columns (root_cause, confidence, impact_summary,
  // suggested_fix). Don't rename these without a DB migration.
  root_cause: string;
  confidence: number;
  impact_summary: string;
  affected_nodes: string[];
  suggested_fix: {
    description: string;
    node_id?: string;
    field?: string;
  } | null;
  // New business-impact framing fields — Problem → Root Cause → Business
  // Impact → What Changed → Recommended Fix → Execution Evidence → Recovery.
  // Optional so old cached incidents (analysed before this change) still
  // deserialize fine.
  problem?: string;
  business_impact?: string;
  what_changed?: string;
  execution_evidence?: string;
  recovery_steps?: string[];
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

export type FindingSeverity = "critical" | "high" | "medium" | "low";

export interface ReviewFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  category: "reliability" | "security" | "performance" | "maintainability" | "cost";
  node_id?: string;
}

export interface WorkflowReview {
  findings: ReviewFinding[];
  overall_risk: FindingSeverity;
  reviewed_at: string;
}

export interface OptimizationOpportunity {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  node_id?: string;
}

export interface WorkflowOptimization {
  opportunities: OptimizationOpportunity[];
}

export interface WorkflowDocumentation {
  title: string;
  overview: string;
  sections: Array<{ heading: string; content: string }>;
  node_docs: Array<{ node_id: string; label: string; purpose: string }>;
}

export interface DeploymentCheck {
  score: number; // 0-100
  status: "ready" | "needs_review" | "blocked";
  blocking_issues: string[];
  warnings: string[];
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
      problem: "The workflow execution failed but no workflow structure changed.",
      business_impact:
        "Runs may keep failing intermittently until the external dependency recovers.",
      what_changed: "Nothing in the workflow itself changed.",
      execution_evidence: errorMessage || "No execution error message was provided.",
      recovery_steps: [
        "Check the status of external services and APIs this workflow depends on.",
        "Verify credentials haven't expired.",
        "Re-run the workflow once the external dependency is confirmed healthy.",
      ],
    };
  }

  const changedNodes = diff.nodes.filter(n => n.status !== "unchanged");

  const prompt = `${COPILOT_PERSONA}
A workflow diff has been detected. Investigate this incident using the
following framing: Problem → Root Cause → Business Impact → What Changed →
Recommended Fix → Execution Evidence → Recovery.

DIFF SUMMARY: ${diff.summary.added} added, ${diff.summary.removed} removed, ${diff.summary.modified} modified nodes.

CHANGED NODES:
${JSON.stringify(changedNodes, null, 2)}

${errorMessage ? `EXECUTION ERROR:\n${errorMessage}` : ""}

Respond ONLY with valid JSON matching this schema exactly. No markdown. No explanation. JSON only:
{
  "problem": "one sentence describing the symptom the user is seeing",
  "root_cause": "one sentence: what broke and why",
  "confidence": 0.85,
  "business_impact": "plain language impact on the business/customer, not just systems",
  "impact_summary": "what downstream nodes/systems are affected",
  "what_changed": "one sentence summarizing the structural change that caused this",
  "affected_nodes": ["node_id_here"],
  "suggested_fix": {
    "description": "plain language fix instruction",
    "node_id": "which node to fix",
    "field": "which field to change"
  },
  "execution_evidence": "one sentence citing the specific error/log evidence used to reach this conclusion",
  "recovery_steps": ["short actionable step", "..."]
}`;

  return callJSON<RootCauseAnalysis>(prompt, 1200, {
    root_cause: "Unable to determine root cause automatically.",
    confidence: 0,
    impact_summary: "Manual investigation required.",
    affected_nodes: [],
    suggested_fix: null,
    problem: "Unable to automatically determine the problem.",
    business_impact: "Unknown — manual investigation required.",
    what_changed: "Unknown.",
    execution_evidence: errorMessage || "No execution error message was provided.",
    recovery_steps: ["Investigate manually using the diff and execution logs."],
  });
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

// ── Full AI review (findings + severity) ────────────────────────────────────
// Distinct from generateWorkflowSummary's short risk list — this produces a
// structured findings list suitable for a review UI (AIReviewPanel / ReviewFinding).
export async function reviewWorkflow(
  workflow: NormalisedWorkFlow
): Promise<WorkflowReview> {
  const prompt = `${COPILOT_PERSONA}
Perform a full review of this workflow and return a structured list of
findings. Cover reliability (missing retries/timeouts, single points of
failure), security (credential handling, unvalidated input), performance
(unnecessary steps, sequential calls that could be parallel), maintainability
(unclear naming, no error branches), and cost (excessive/duplicate calls).
Only report real findings — do not invent problems if the workflow is fine.

PLATFORM: ${workflow.meta?.platform || "unknown"}
NODES:
${JSON.stringify(workflow.nodes.map(n => ({ id: n.id, type: n.type, label: n.label, has_credential: !!n.credential_ref })), null, 2)}
EDGES:
${JSON.stringify(workflow.edges, null, 2)}

Respond ONLY with valid JSON matching this schema exactly. No markdown. JSON only:
{
  "findings": [
    {
      "id": "short-slug-id",
      "title": "short finding title",
      "description": "1-2 sentence explanation of the finding and why it matters",
      "severity": "critical | high | medium | low",
      "category": "reliability | security | performance | maintainability | cost",
      "node_id": "optional node id this finding relates to"
    }
  ],
  "overall_risk": "critical | high | medium | low"
}`;

  const result = await callJSON<{ findings: ReviewFinding[]; overall_risk: FindingSeverity }>(
    prompt,
    1200,
    { findings: [], overall_risk: "low" }
  );

  return { ...result, reviewed_at: new Date().toISOString() };
}

// ── Structured optimization suggestions ─────────────────────────────────────
// Standalone version of the opportunities list embedded in generateWorkflowSummary,
// for callers (OptimizationPanel) that want just this without a full summary call.
export async function optimizeWorkflow(
  workflow: NormalisedWorkFlow
): Promise<WorkflowOptimization> {
  const prompt = `${COPILOT_PERSONA}
Suggest concrete optimization opportunities for this workflow: redundant or
duplicate steps, missing error handling, steps that could run in parallel,
overly complex branching that could be simplified, or unnecessary API calls.
Only include real, specific opportunities grounded in the actual nodes below.

NODES:
${JSON.stringify(workflow.nodes.map(n => ({ id: n.id, type: n.type, label: n.label, config: n.config })), null, 2)}
EDGES:
${JSON.stringify(workflow.edges, null, 2)}

Respond ONLY with valid JSON matching this schema exactly. No markdown. JSON only:
{
  "opportunities": [
    {
      "id": "short-slug-id",
      "title": "short opportunity title",
      "description": "1-2 sentence explanation of the optimization and its benefit",
      "impact": "low | medium | high",
      "node_id": "optional node id this relates to"
    }
  ]
}`;

  return callJSON<WorkflowOptimization>(prompt, 900, { opportunities: [] });
}

// ── Auto-generated documentation ─────────────────────────────────────────────
export async function documentWorkflow(
  workflow: NormalisedWorkFlow
): Promise<WorkflowDocumentation> {
  const prompt = `${COPILOT_PERSONA}
Write human-readable documentation for this workflow: an overview of what it
does and why it likely exists, a short section for each major stage of the
flow (e.g. "Trigger", "Processing", "Notification"), and a one-line purpose
for each node.

PLATFORM: ${workflow.meta?.platform || "unknown"}
NAME: ${workflow.meta?.name || "Unnamed workflow"}
NODES:
${JSON.stringify(workflow.nodes.map(n => ({ id: n.id, type: n.type, label: n.label })), null, 2)}
EDGES:
${JSON.stringify(workflow.edges, null, 2)}

Respond ONLY with valid JSON matching this schema exactly. No markdown. JSON only:
{
  "title": "short documentation title",
  "overview": "2-4 sentence plain-language overview of what this workflow does",
  "sections": [
    { "heading": "stage name", "content": "1-3 sentences describing this stage" }
  ],
  "node_docs": [
    { "node_id": "node id", "label": "node label", "purpose": "one-line purpose" }
  ]
}`;

  return callJSON<WorkflowDocumentation>(prompt, 1500, {
    title: workflow.meta?.name || "Untitled workflow",
    overview: "AI documentation is unavailable right now.",
    sections: [],
    node_docs: [],
  });
}

// ── Deployment readiness check ───────────────────────────────────────────────
export async function checkDeploymentReadiness(
  workflow: NormalisedWorkFlow,
  recentDiff?: WorkflowDiff
): Promise<DeploymentCheck> {
  const prompt = `${COPILOT_PERSONA}
Assess whether this workflow is safe to deploy to production. Score it 0-100
(100 = fully ready). List any blocking issues (must fix before deploy — e.g.
missing error handling on a payment/critical step, hardcoded credentials,
no retry on an external call that's part of a critical path) separately from
warnings (should fix, but not blocking).

NODES:
${JSON.stringify(workflow.nodes.map(n => ({ id: n.id, type: n.type, label: n.label, has_credential: !!n.credential_ref })), null, 2)}
EDGES:
${JSON.stringify(workflow.edges, null, 2)}
${recentDiff ? `RECENT CHANGE:\n${JSON.stringify(recentDiff.summary, null, 2)}` : ""}

Respond ONLY with valid JSON matching this schema exactly. No markdown. JSON only:
{
  "score": 82,
  "status": "ready | needs_review | blocked",
  "blocking_issues": ["short blocking issue statement", "..."],
  "warnings": ["short warning statement", "..."]
}`;

  return callJSON<DeploymentCheck>(prompt, 900, {
    score: 0,
    status: "needs_review",
    blocking_issues: [],
    warnings: ["AI deployment check is unavailable right now — review manually."],
  });
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

// ── Semantic workflow search (lightweight, no vector store) ─────────────────
// Answers natural-language questions like "where is Stripe used?" by handing
// the model a compact index of every workflow's nodes. This is a pragmatic
// v1 — it re-sends the whole index on every query and doesn't rank by
// embedding similarity, so it works fine for small/medium teams but will
// need a real vector store (pgvector, Pinecone, etc.) once workflow count
// grows large. Swap this function's internals for an embedding-based
// retrieval step without changing the route contract.
export interface SearchableWorkflow {
  id: string;
  name: string;
  platform: string;
  nodes: Array<{ id: string; type: string; label: string; credential_ref?: string }>;
}

export interface SemanticSearchResult {
  answer: string;
  matches: Array<{ workflow_id: string; workflow_name: string; reason: string }>;
}

export async function answerWorkflowQuery(
  query: string,
  workflows: SearchableWorkflow[]
): Promise<SemanticSearchResult> {
  if (workflows.length === 0) {
    return { answer: "No workflows to search yet.", matches: [] };
  }

  const index = workflows.map(w => ({
    id: w.id,
    name: w.name,
    platform: w.platform,
    nodes: w.nodes.map(n => ({ id: n.id, type: n.type, label: n.label, credential: n.credential_ref || null })),
  }));

  const prompt = `${COPILOT_PERSONA}
Answer this natural-language question about the team's workflows using ONLY
the workflow index below. Questions may be about where a service/app is
used, which workflows send emails, which lack retries, which depend on a
given credential, etc. If nothing matches, say so plainly.

QUESTION: "${query}"

WORKFLOW INDEX:
${JSON.stringify(index, null, 2)}

Respond ONLY with valid JSON matching this schema exactly. No markdown. JSON only:
{
  "answer": "1-3 sentence plain-language answer to the question",
  "matches": [
    { "workflow_id": "id from the index", "workflow_name": "name from the index", "reason": "why this workflow matches" }
  ]
}`;

  return callJSON<SemanticSearchResult>(prompt, 1000, {
    answer: "AI search is unavailable right now.",
    matches: [],
  });
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