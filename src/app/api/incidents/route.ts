// ─────────────────────────────────────────────────────────────
// src/app/api/incidents/route.ts
// GET /api/incidents?workflow_id=xxx&status=open — list incidents
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, supabase } = ctx;

  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflow_id");
  const status = searchParams.get("status") || "open";

  let query = supabase
    .from("flowlens_incidents")
    .select("*")
    .eq("team_id", teamId)
    .eq("status", status)
    .order("detected_at", { ascending: false });

  if (workflowId) query = query.eq("workflow_id", workflowId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ incidents: data });
}


