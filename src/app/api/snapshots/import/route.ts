// ─────────────────────────────────────────────────────────────
// src/app/api/snapshots/import/route.ts
// POST /api/snapshots/import — normalise + store a workflow snapshot
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { normalise, detectPlatform } from "@/lib/services/normalizer";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;

  const { workflow_id, platform: explicitPlatform, raw_json, label } =
    await request.json();

  if (!workflow_id || !raw_json) {
    return NextResponse.json(
      { error: "workflow_id and raw_json are required" },
      { status: 400 }
    );
  }

  const platform = explicitPlatform || detectPlatform(raw_json);
  if (platform === "unknown") {
    return NextResponse.json(
      { error: "Could not detect workflow platform. Specify platform manually." },
      { status: 400 }
    );
  }

  let normalised;
  try {
    normalised = normalise(platform, raw_json);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  const { data: snapshot, error } = await db
    .from("flowlens_snapshots")
    .insert({
      workflow_id,
      team_id: teamId,
      normalised,
      raw: raw_json,
      source: "import",
      label: label || null,
      created_by: user.id,
      execution_status: "unknown",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update workflow last_snapshot_at
  await db
    .from("flowlens_workflows")
    .update({
      last_snapshot_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "healthy",
    })
    .eq("id", workflow_id);

  // Log it
  await db.from("change_log").insert({
    workflow_id,
    team_id: teamId,
    snapshot_id: snapshot.id,
    actor_id: user.id,
    actor_type: "user",
    action: "snapshot_created",
  });

  return NextResponse.json({ snapshot }, { status: 201 });
}


