// ─────────────────────────────────────────────────────────────
// src/app/api/snapshots/route.ts
// GET /api/snapshots?workflow_id=xxx — list snapshots for a workflow
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, supabase } = ctx;

  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflow_id");

  if (!workflowId) {
    return NextResponse.json({ error: "workflow_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("flowlens_snapshots")
    .select("id, created_at, source, execution_status, error_message, label, created_by")
    .eq("workflow_id", workflowId)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ snapshots: data });
}


