// ─────────────────────────────────────────────────────────────
// src/app/api/workflows/[id]/fix/route.ts
// POST /api/workflows/:id/fix — diagnose a broken workflow and propose a
//   structured, validated fix. Does NOT apply anything yet — this is the
//   "Diagnose Issue -> Generate Fix -> Structured Operations -> Validator"
//   half of the loop. See ./[attemptId]/apply for the apply+test half.
// GET  /api/workflows/:id/fix — list past fix attempts for this workflow.
// ─────────────────────────────────────────────────────────────

import { NextResponse, NextRequest } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { generateRepairFix } from "@/lib/services/ai";
import { validateOperations, normalizeOperations } from "@/lib/services/repairValidator";
import { assertAiAllowed } from "@/lib/services/aiSettings";
import type { RepairOperation } from "@/types/flowlens";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;
  const { id } = await params;

  const { data, error } = await db
    .from("flowlens_fix_attempts")
    .select("*")
    .eq("workflow_id", id)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attempts: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;
  const { id: workflowId } = await params;

  const gate = await assertAiAllowed(db, teamId, "fix");
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { error_message, retry_of, user_request } = body as {
    error_message?: string;
    retry_of?: string;
    user_request?: string;
  };

  // 1. Load the workflow + its latest snapshot (the thing we're fixing).
  const { data: workflow } = await db
    .from("flowlens_workflows")
    .select("*")
    .eq("id", workflowId)
    .eq("team_id", teamId)
    .single();

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const { data: latestSnapshot } = await db
    .from("flowlens_snapshots")
    .select("id, normalised, error_message, execution_status")
    .eq("workflow_id", workflowId)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!latestSnapshot?.normalised) {
    return NextResponse.json(
      { error: "No snapshot found for this workflow yet — import it first." },
      { status: 400 }
    );
  }

  const effectiveError = error_message || latestSnapshot.error_message || undefined;

  // 2. If this is a retry, pull prior attempts on this workflow so the AI
  //    doesn't propose the same fix twice.
  let attemptNumber = 1;
  let previousAttempts: Array<{ diagnosis: string; operations: RepairOperation[]; test_result: unknown }> = [];

  const { data: priorAttempts } = await db
    .from("flowlens_fix_attempts")
    .select("attempt_number, diagnosis, operations, test_result")
    .eq("workflow_id", workflowId)
    .eq("team_id", teamId)
    .order("attempt_number", { ascending: false })
    .limit(5);

  if (priorAttempts && priorAttempts.length > 0) {
    attemptNumber = (priorAttempts[0].attempt_number || 1) + 1;
    previousAttempts = priorAttempts.map(a => ({
      diagnosis: a.diagnosis,
      operations: (a.operations || []) as unknown as RepairOperation[],
      test_result: a.test_result,
    }));
  }

  // 3. Diagnose + propose (AI Provider step).
  const suggestion = await generateRepairFix(
    latestSnapshot.normalised,
    effectiveError,
    previousAttempts
  );

  // 4. Normalize (self-heal trivially derivable fields like handlerNodeId)
  //    then validate (Validator step) before storing this as actionable.
  const normalizedOps = normalizeOperations(latestSnapshot.normalised, suggestion.operations);
  const validation = validateOperations(latestSnapshot.normalised, normalizedOps);

  // 5. Persist the proposal for review / audit / retry-chaining.
  const { data: attempt, error } = await db
    .from("flowlens_fix_attempts")
    .insert({
      workflow_id: workflowId,
      team_id: teamId,
      base_snapshot_id: latestSnapshot.id,
      attempt_number: attemptNumber,
      retry_of: retry_of || null,
      user_request: user_request || "Fix Workflow",
      error_message: effectiveError || null,
      diagnosis: suggestion.diagnosis,
      reason: suggestion.reason,
      operations: normalizedOps,
      validation,
      status: validation.valid ? "validated" : "proposed",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ attempt }, { status: 201 });
}
