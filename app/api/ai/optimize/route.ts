// ─────────────────────────────────────────────────────────────
// src/app/api/ai/optimize/route.ts
// POST /api/ai/optimize — structured optimization opportunities
// Body: { snapshot_id: string }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { optimizeWorkflow } from "@/lib/services/ai";
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
    .select("id, workflow_id, normalised")
    .eq("id", snapshot_id)
    .eq("team_id", teamId)
    .single();

  if (error || !snapshot) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  try {
    const optimization = await optimizeWorkflow(snapshot.normalised);
    return NextResponse.json({ optimization, workflow_id: snapshot.workflow_id });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Optimization failed." }, { status: 500 });
  }
}
