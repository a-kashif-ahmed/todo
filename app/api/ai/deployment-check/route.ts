// ─────────────────────────────────────────────────────────────
// src/app/api/ai/deployment-check/route.ts
// POST /api/ai/deployment-check — deployment readiness score + blocking issues
// Body: { snapshot_id: string, compare_snapshot_id?: string }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { checkDeploymentReadiness } from "@/lib/services/ai";
import { diffWorkflows } from "@/lib/services/diff";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { snapshot_id, compare_snapshot_id } = await request.json();

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

  // Optionally factor in what changed since the last deployed/known-good
  // snapshot — e.g. "just removed a retry" should weigh into the score.
  let recentDiff = undefined;
  if (compare_snapshot_id) {
    const { data: compareSnapshot } = await db
      .from("flowlens_snapshots")
      .select("normalised")
      .eq("id", compare_snapshot_id)
      .eq("team_id", teamId)
      .single();

    if (compareSnapshot) {
      try {
        recentDiff = diffWorkflows(compareSnapshot.normalised, snapshot.normalised);
      } catch (e) {
        console.error("diffWorkflows failed in deployment-check:", e);
      }
    }
  }

  try {
    const check = await checkDeploymentReadiness(snapshot.normalised, recentDiff);
    return NextResponse.json({ check, workflow_id: snapshot.workflow_id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
