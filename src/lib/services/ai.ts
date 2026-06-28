
// import { WorkflowDiff } from "@/types/flowlens";

// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// export interface RootCauseAnalysis {
//   root_cause: string;
//   confidence: number;
//   impact_summary: string;
//   affected_nodes: string[];
//   suggested_fix: {
//     description: string;
//     node_id?: string;
//     field?: string;
//   } | null;
// }

// export async function analyseRootCause(
//   diff: WorkflowDiff,
//   errorMessage?: string
// ): Promise<RootCauseAnalysis> {
//   // Don't bother calling AI if there are no changes
//   if (diff.summary.added === 0 && diff.summary.removed === 0 && diff.summary.modified === 0) {
//     return {
//       root_cause: "No structural changes detected between snapshots.",
//       confidence: 1,
//       impact_summary: "The failure may be caused by external factors such as API downtime or credential expiry.",
//       affected_nodes: [],
//       suggested_fix: null,
//     };
//   }

//   const changedNodes = diff.nodes.filter(n => n.status !== "unchanged");

//   const prompt = `You are a workflow automation debugging expert.
// A workflow diff has been detected. Identify the root cause of failure.

// DIFF SUMMARY: ${diff.summary.added} added, ${diff.summary.removed} removed, ${diff.summary.modified} modified nodes.

// CHANGED NODES:
// ${JSON.stringify(changedNodes, null, 2)}

// ${errorMessage ? `EXECUTION ERROR:\n${errorMessage}` : ""}

// Respond ONLY with valid JSON matching this schema exactly:
// {
//   "root_cause": "one sentence: what broke and why",
//   "confidence": 0.0,
//   "impact_summary": "what downstream nodes/systems are affected",
//   "affected_nodes": ["node_id"],
//   "suggested_fix": {
//     "description": "plain language fix instruction",
//     "node_id": "which node",
//     "field": "which field"
//   }
// }
// No markdown. No explanation. JSON only.`;

//   const response = await anthropic.messages.create({
//     model: "claude-sonnet-4-6",
//     max_tokens: 1000,
//     messages: [{ role: "user", content: prompt }],
//   });

//   const text =
//     response.content[0].type === "text" ? response.content[0].text : "{}";

//   try {
//     return JSON.parse(text) as RootCauseAnalysis;
//   } catch {
//     return {
//       root_cause: "Unable to determine root cause automatically.",
//       confidence: 0,
//       impact_summary: "Manual investigation required.",
//       affected_nodes: [],
//       suggested_fix: null,
//     };
//   }
// }

// export function createChatStream(
//   messages: Array<{ role: "user" | "assistant"; content: string }>,
//   context: string
// ) {
//   return anthropic.messages.stream({
//     model: "claude-sonnet-4-6",
//     max_tokens: 1000,
//     system: `You are FlowLens AI, a workflow automation debugging assistant.
// Be concise and specific. Reference node names and field names when explaining issues.
// ${context}`,
//     messages,
//   });
// }