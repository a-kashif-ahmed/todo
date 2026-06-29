// ─────────────────────────────────────────────────────────────
// src/app/api/workflows/[id]/route.ts
// GET   /api/workflows/:id  — get single workflow
// PATCH /api/workflows/:id  — update workflow name/status
// DELETE /api/workflows/:id — delete workflow
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
    .from("flowlens_workflows")
    .select("*")
    .eq("id", params.id)
    .eq("team_id", teamId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }
  return NextResponse.json({ workflow: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const body = await request.json();
  const allowed = ["name", "status", "external_id"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  allowed.forEach(k => { if (k in body) updates[k] = body[k]; });

  const { data, error } = await db
    .from("flowlens_workflows")
    .update(updates)
    .eq("id", params.id)
    .eq("team_id", teamId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ workflow: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { error } = await db
    .from("flowlens_workflows")
    .delete()
    .eq("id", params.id)
    .eq("team_id", teamId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


