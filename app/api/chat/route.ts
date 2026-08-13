// ─────────────────────────────────────────────────────────────
// src/app/api/ai/chat/route.ts
// POST /api/ai/chat — streaming AI assistant
// ─────────────────────────────────────────────────────────────

import { getAuthContext } from "@/lib/supabase/auth-helper";
import { createChatStream } from "@/lib/services/ai";
import { NextResponse } from "next/server";

// Builds a complete workflow-aware context string server-side instead of
// trusting only whatever the client passed in. Falls back gracefully if the
// workflow/snapshot can't be loaded so chat still works without it.
async function buildWorkflowContext(
  db: any,
  teamId: string,
  workflowId?: string,
  clientContext = ""
): Promise<string> {
  const parts: string[] = [];
  if (clientContext) parts.push(clientContext);

  if (workflowId) {
    try {
      const { data: workflow } = await db
        .from("flowlens_workflows")
        .select("*")
        .eq("id", workflowId)
        .eq("team_id", teamId)
        .single();

      if (workflow) {
        parts.push(
          `Workflow: ${workflow.name} (platform: ${workflow.platform}, status: ${workflow.status}).`
        );
      }

      const { data: snapshots } = await db
        .from("flowlens_snapshots")
        .select("id, normalised, created_at")
        .eq("workflow_id", workflowId)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(1);

      const latest = snapshots?.[0];
      if (latest?.normalised) {
        const { nodes = [], edges = [] } = latest.normalised;
        parts.push(
          `Latest snapshot has ${nodes.length} nodes and ${edges.length} edges.`
        );
        parts.push(
          `Nodes: ${nodes.map((n: any) => `${n.label} (${n.type})`).join(", ")}`
        );
      }
    } catch (e) {
      console.error("buildWorkflowContext failed:", e);
    }
  }

  return parts.join("\n");
}

// Simple in-memory rate limiter (upgrade to Upstash Redis in production)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(userId: string, max = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (rateLimitMap.get(userId) || []).filter(t => now - t < windowMs);
  if (hits.length >= max) return true;
  rateLimitMap.set(userId, [...hits, now]);
  return false;
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;

  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Wait a minute." },
      { status: 429 }
    );
  }

  const { messages, context = "", workflowId } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  try {
    const fullContext = await buildWorkflowContext(db, teamId, workflowId, context);
    return await createChatStream(messages, fullContext);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


