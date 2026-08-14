
// ─────────────────────────────────────────────────────────────
// src/app/api/workflows/route.ts
// GET  /api/workflows       — list all workflows for team
// POST /api/workflows       — create a new workflow
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { data, error } = await db
    .from("flowlens_workflows")
    .select("*, flowlens_snapshots(count)")
    .eq("team_id", teamId)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach each workflow's latest AI summary/review so the dashboard and
  // workflow list can show complexity/risk/review-status without every
  // caller having to fetch snapshots separately. Best-effort per workflow —
  // one missing snapshot doesn't fail the whole list.
  const workflows = data || [];
  await Promise.all(
    workflows.map(async (wf: any) => {
      try {
        const { data: snap } = await db
          .from("flowlens_snapshots")
          .select("ai_summary, ai_review, created_at")
          .eq("workflow_id", wf.id)
          .eq("team_id", teamId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        wf.latest_ai_summary = snap?.ai_summary || null;
        wf.latest_ai_review = snap?.ai_review || null;
      } catch (e) {
        wf.latest_ai_summary = null;
        wf.latest_ai_review = null;
      }
    })
  );

  return NextResponse.json({ workflows });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;

  const { name, platform, external_id } = await request.json();

  if (!name || !platform) {
    return NextResponse.json(
      { error: "name and platform are required" },
      { status: 400 }
    );
  }

  const { data, error } = await db
    .from("flowlens_workflows")
    .insert({
      name,
      platform,
      external_id: external_id || null,
      team_id: teamId,
      status: "unknown",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workflow: data }, { status: 201 });
}


