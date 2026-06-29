// ─────────────────────────────────────────────────────────────
// src/app/api/snapshots/restore/route.ts
// POST /api/snapshots/restore — restore workflow to a previous snapshot
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;

  const { snapshot_id, workflow_id } = await request.json();

  if (!snapshot_id || !workflow_id) {
    return NextResponse.json(
      { error: "snapshot_id and workflow_id required" },
      { status: 400 }
    );
  }

  // Fetch the snapshot to restore
  const { data: original } = await db
    .from("flowlens_snapshots")
    .select("normalised, raw")
    .eq("id", snapshot_id)
    .eq("team_id", teamId)
    .single();

  if (!original) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  // Create a new snapshot cloned from the original (restore = new snapshot)
  const { data: restored, error } = await db
    .from("flowlens_snapshots")
    .insert({
      workflow_id,
      team_id: teamId,
      normalised: original.normalised,
      raw: original.raw,
      source: "manual",
      label: `Restored from ${snapshot_id}`,
      created_by: user.id,
      execution_status: "unknown",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update workflow status back to healthy
  await db
    .from("flowlens_workflows")
    .update({ status: "healthy", updated_at: new Date().toISOString() })
    .eq("id", workflow_id);

  // Log it
  await db.from("change_log").insert({
    workflow_id,
    team_id: teamId,
    snapshot_id: restored.id,
    actor_id: user.id,
    actor_type: "user",
    action: "restored",
  });

  return NextResponse.json({ snapshot: restored }, { status: 201 });
}

