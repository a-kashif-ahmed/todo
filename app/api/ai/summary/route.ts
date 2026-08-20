// ─────────────────────────────────────────────────────────────
// src/app/api/ai/summary/route.ts
// POST /api/ai/summary — AI Workflow Copilot summary + complexity score
// Body: { snapshot_id: string }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { generateWorkflowSummary } from "@/lib/services/ai";
import { assertAiAllowed } from "@/lib/services/aiSettings";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const gate = await assertAiAllowed(db, teamId, "analysis");
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const { snapshot_id } = await request.json();

  if (!snapshot_id) {
    return NextResponse.json({ error: "snapshot_id is required" }, { status: 400 });
  }

  const { data: snapshot, error } = await db
    .from("flowlens_snapshots")
    .select("id, normalised")
    .eq("id", snapshot_id)
    .eq("team_id", teamId)
    .single();

  if (error || !snapshot) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  try {
    const summary = await generateWorkflowSummary(snapshot.normalised);
    return NextResponse.json({ summary });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Summary generation failed." }, { status: 500 });
  }
}
