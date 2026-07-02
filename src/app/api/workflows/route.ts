
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
  const { teamId, supabase } = ctx;

  const { data, error } = await supabase
    .from("flowlens_workflows")
    .select("*, flowlens_snapshots(count)")
    .eq("team_id", teamId)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workflows: data });
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


