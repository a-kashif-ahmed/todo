// ─────────────────────────────────────────────────────────────
// src/app/api/workflows/[id]/fix/[attemptId]/apply/route.ts
// POST — apply a validated fix attempt: create a modified snapshot, run the
//   structural test step, and record success/failure. This is the human
//   approval gate the doc calls for — nothing here runs until the person
//   clicks "Apply Fix" on an already-validated proposal.
// ─────────────────────────────────────────────────────────────

import { NextResponse, NextRequest } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { applyOperations } from "@/lib/services/repairEngine";
import { testRepair } from "@/lib/services/repairTest";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;
  const { id: workflowId, attemptId } = await params;

  const { data: attempt } = await db
    .from("flowlens_fix_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("workflow_id", workflowId)
    .eq("team_id", teamId)
    .single();

  if (!attempt) {
    return NextResponse.json({ error: "Fix attempt not found" }, { status: 404 });
  }

  if (!attempt.validation?.valid) {
    return NextResponse.json(
      { error: "This fix attempt did not pass validation and cannot be applied." },
      { status: 400 }
    );
  }

  if (attempt.status === "success" || attempt.status === "failed") {
    return NextResponse.json(
      { error: "This fix attempt has already been applied and tested." },
      { status: 400 }
    );
  }

  const { data: baseSnapshot } = await db
    .from("flowlens_snapshots")
    .select("id, normalised, raw")
    .eq("id", attempt.base_snapshot_id)
    .eq("team_id", teamId)
    .single();

  if (!baseSnapshot?.normalised) {
    return NextResponse.json({ error: "Base snapshot for this attempt is missing." }, { status: 400 });
  }

  // 1. Apply — never mutate the base snapshot, always produce a new one.
  const fixedWorkflow = applyOperations(baseSnapshot.normalised, attempt.operations);

  const { data: resultSnapshot, error: snapErr } = await db
    .from("flowlens_snapshots")
    .insert({
      workflow_id: workflowId,
      team_id: teamId,
      normalised: fixedWorkflow,
      raw: baseSnapshot.raw,
      source: "ai_fix",
      label: `AI fix: ${attempt.diagnosis?.slice(0, 80) || "workflow repair"}`,
      created_by: user.id,
      execution_status: "unknown",
    })
    .select()
    .single();

  if (snapErr) return NextResponse.json({ error: snapErr.message }, { status: 500 });

  // 2. Test — structural verification (see repairTest.ts for scope notes).
  const testResult = testRepair(fixedWorkflow, attempt.operations);
  const finalStatus = testResult.passed ? "success" : "failed";

  const { data: updatedAttempt, error: updateErr } = await db
    .from("flowlens_fix_attempts")
    .update({
      result_snapshot_id: resultSnapshot.id,
      test_result: testResult,
      status: finalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // 3. On success, reflect it on the workflow + audit trail. On failure we
  //    leave workflow status alone — the person can retry or investigate.
  if (testResult.passed) {
    await db
      .from("flowlens_workflows")
      .update({ status: "healthy", updated_at: new Date().toISOString() })
      .eq("id", workflowId);
  }

  await db.from("change_log").insert({
    workflow_id: workflowId,
    team_id: teamId,
    snapshot_id: resultSnapshot.id,
    actor_id: user.id,
    actor_type: "ai",
    action: testResult.passed ? "ai_fix_applied_success" : "ai_fix_applied_failed",
  });

  return NextResponse.json({ attempt: updatedAttempt, snapshot: resultSnapshot, test_result: testResult });
}
