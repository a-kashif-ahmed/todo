// ─────────────────────────────────────────────────────────────
// src/app/api/ai/document/route.ts
// POST /api/ai/document — auto-generate human-readable documentation
// Body: { snapshot_id: string }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { documentWorkflow } from "@/lib/services/ai";
import { assertAiAllowed } from "@/lib/services/aiSettings";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const gate = await assertAiAllowed(db, teamId, "documentation");
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
    const documentation = await documentWorkflow(snapshot.normalised);

    // Best-effort persistence — safe no-op if the column doesn't exist yet.
    try {
      await db
        .from("flowlens_snapshots")
        .update({ ai_documentation: documentation })
        .eq("id", snapshot.id);
    } catch (persistErr) {
      console.error("Persisting ai_documentation failed (column may not exist yet):", persistErr);
    }

    return NextResponse.json({ documentation, workflow_id: snapshot.workflow_id });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Documentation generation failed." }, { status: 500 });
  }
}
