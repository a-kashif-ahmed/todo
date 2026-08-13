// ─────────────────────────────────────────────────────────────
// src/app/api/webhooks/n8n/route.ts
// POST /api/webhooks/n8n — receive execution events from n8n
// No auth — called externally by n8n
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { normalise } from "@/lib/services/normalizer";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate webhook secret header
    const secret = request.headers.get("x-flowlens-secret");
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServiceClient();

    // Find workflow by external n8n ID
    const { data: workflow } = await db
      .from("flowlens_workflows")
      .select("id, team_id")
      .eq("external_id", String(body.workflowId))
      .single();

    if (!workflow) {
      // Not registered in FlowLens — ignore silently
      return NextResponse.json({ ok: true, ignored: true });
    }

    const executionStatus = body.status === "error" ? "failure" : "success";

    // Normalise the workflow JSON attached to the webhook payload
    let normalised;
    try {
      normalised = normalise("n8n", body.workflow || body);
    } catch {
      return NextResponse.json({ error: "Could not normalise workflow" }, { status: 400 });
    }

    // Store snapshot
    const { data: snapshot } = await db
      .from("flowlens_snapshots")
      .insert({
        workflow_id: workflow.id,
        team_id: workflow.team_id,
        normalised,
        raw: body,
        source: "webhook",
        execution_status: executionStatus,
        error_message: body.error?.message || null,
      })
      .select()
      .single();

    if (executionStatus === "failure") {
      // Find last successful snapshot for comparison
      const { data: lastGood } = await db
        .from("flowlens_snapshots")
        .select("id")
        .eq("workflow_id", workflow.id)
        .eq("execution_status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Create incident
      await db.from("flowlens_incidents").insert({
        workflow_id: workflow.id,
        team_id: workflow.team_id,
        snapshot_before: lastGood?.id || null,
        snapshot_after: snapshot.id,
        error_message: body.error?.message || null,
        status: "open",
      });

      // Mark workflow as failing
      await db
        .from("flowlens_workflows")
        .update({ status: "failing", updated_at: new Date().toISOString() })
        .eq("id", workflow.id);
    } else {
      // Mark workflow as healthy
      await db
        .from("flowlens_workflows")
        .update({
          status: "healthy",
          last_snapshot_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", workflow.id);
    }

    // Always respond fast
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}