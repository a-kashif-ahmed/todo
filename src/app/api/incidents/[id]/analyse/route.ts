// ─────────────────────────────────────────────────────────────
// src/app/api/incidents/[id]/analyse/route.ts
// POST /api/incidents/:id/analyse — run AI root cause analysis
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { diffWorkflows } from "@/lib/services/diff";
import { analyseRootCause } from "@/lib/services/ai";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { data: incident } = await db
    .from("flowlens_incidents")
    .select(`
      *,
      snap_before:snapshot_before(normalised),
      snap_after:snapshot_after(normalised)
    `)
    .eq("id", params.id)
    .eq("team_id", teamId)
    .single();

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  // Return cached result — never call AI twice for same incident
  if (incident.root_cause) {
    return NextResponse.json({
      cached: true,
      analysis: {
        root_cause: incident.root_cause,
        confidence: incident.confidence,
        impact_summary: incident.impact_summary,
        suggested_fix: incident.suggested_fix,
      },
    });
  }

  if (!incident.snap_before || !incident.snap_after) {
    return NextResponse.json(
      { error: "Incident is missing one or both snapshots" },
      { status: 400 }
    );
  }

  const diff = diffWorkflows(
    incident.snap_before.normalised,
    incident.snap_after.normalised
  );

  const analysis = await analyseRootCause(diff, incident.error_message);

  // Store result on incident
  await db
    .from("flowlens_incidents")
    .update({
      root_cause: analysis.root_cause,
      confidence: analysis.confidence,
      impact_summary: analysis.impact_summary,
      suggested_fix: analysis.suggested_fix,
    })
    .eq("id", params.id);

  return NextResponse.json({ cached: false, analysis, diff });
}


