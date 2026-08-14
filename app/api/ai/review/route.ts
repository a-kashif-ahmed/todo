// ─────────────────────────────────────────────────────────────
// src/app/api/ai/review/route.ts
// POST /api/ai/review — AI Workflow Copilot review (findings + severity)
// Body: { snapshot_id: string }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { reviewWorkflow } from "@/lib/services/ai";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { snapshot_id } = await request.json();

  if (!snapshot_id) {
    return NextResponse.json({ error: "snapshot_id is required" }, { status: 400 });
  }

  const { data: snapshot, error } = await db
    .from("flowlens_snapshots")
    .select("id, workflow_id, normalised")
    .eq("id", snapshot_id)
    .eq("team_id", teamId)
    .single();

  if (error || !snapshot) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  try {
    const review = await reviewWorkflow(snapshot.normalised);

    // Best-effort persistence so the dashboard's "Recent Workflow Reviews"
    // and "AI Findings" widgets have something to read without re-running
    // AI on every page load. Safe no-op if the column doesn't exist yet.
    try {
      await db
        .from("flowlens_snapshots")
        .update({ ai_review: review })
        .eq("id", snapshot.id);
    } catch (persistErr) {
      console.error("Persisting ai_review failed (column may not exist yet):", persistErr);
    }

    return NextResponse.json({ review, workflow_id: snapshot.workflow_id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
