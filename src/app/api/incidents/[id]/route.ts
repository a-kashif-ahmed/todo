// ─────────────────────────────────────────────────────────────
// src/app/api/incidents/[id]/route.ts
// GET   /api/incidents/:id        — get single incident
// PATCH /api/incidents/:id        — update status (resolve/dismiss)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, supabase } = ctx;

  const { data, error } = await supabase
    .from("flowlens_incidents")
    .select("*")
    .eq("id", params.id)
    .eq("team_id", teamId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }
  return NextResponse.json({ incident: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { status } = await request.json();
  const allowed = ["open", "resolved", "dismissed"];

  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { status };
  if (status === "resolved") updates.resolved_at = new Date().toISOString();

  const { data, error } = await db
    .from("flowlens_incidents")
    .update(updates)
    .eq("id", params.id)
    .eq("team_id", teamId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ incident: data });
}


