// ─────────────────────────────────────────────────────────────
// src/app/api/snapshots/[id]/route.ts
// GET /api/snapshots/:id — get single snapshot with normalised data
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
    .from("flowlens_snapshots")
    .select("*")
    .eq("id", params.id)
    .eq("team_id", teamId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }
  return NextResponse.json({ snapshot: data });
}


