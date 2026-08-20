// ─────────────────────────────────────────────────────────────
// src/lib/services/aiSettings.ts
// Single source of truth for the team's AI & Privacy settings, and the
// gate every AI-calling route uses to actually respect them.
//
// Previously these settings (app/api/settings/ai/route.ts) saved to the DB
// correctly but were never read anywhere else — toggling "AI analysis" off
// or setting "processing location" to local/self-hosted changed nothing.
// This file is what makes them real.
// ─────────────────────────────────────────────────────────────

export interface AISettings {
  ai_analysis_enabled: boolean;
  workflow_data_processing: boolean;
  ai_documentation_enabled: boolean;
  automatic_reviews_enabled: boolean;
  privacy_mode: "standard" | "strict";
  processing_location: "cloud" | "local" | "self_hosted";
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  ai_analysis_enabled: true,
  workflow_data_processing: true,
  ai_documentation_enabled: true,
  automatic_reviews_enabled: false,
  privacy_mode: "standard",
  processing_location: "cloud",
};

// The real Supabase client's query builder is thenable but not a strict
// Promise (it has extra chainable methods), so this stays loosely typed —
// matching how `db` is typed everywhere else in this codebase — rather
// than fighting Supabase's builder types for a helper this small.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbLike = any;

export async function getAiSettings(db: DbLike, teamId: string): Promise<AISettings> {
  try {
    const { data, error } = await db
      .from("flowlens_teams")
      .select("ai_settings")
      .eq("id", teamId)
      .single();

    if (error) throw error;
    return { ...DEFAULT_AI_SETTINGS, ...(data?.ai_settings || {}) };
  } catch {
    // `ai_settings` column may not exist yet (pre-migration) — fall back to
    // defaults rather than blocking every AI call because of a schema gap.
    return DEFAULT_AI_SETTINGS;
  }
}

export type AiFeature =
  | "analysis"       // incident root-cause analysis, insights, reviews
  | "documentation"   // /api/ai/document
  | "automatic_review" // reviews/scans not directly requested by a click
  | "chat"            // /api/chat
  | "fix";             // Fix Workflow diagnose/apply

export interface AiGateResult {
  allowed: boolean;
  reason?: string;
  settings: AISettings;
}

// The one place that decides whether an AI call is allowed to happen.
// `includesWorkflowData` should be true for anything that sends node
// configs/edges/execution errors to the model (nearly everything except a
// context-free chat message).
export async function assertAiAllowed(
  db: DbLike,
  teamId: string,
  feature: AiFeature,
  { includesWorkflowData = true }: { includesWorkflowData?: boolean } = {}
): Promise<AiGateResult> {
  const settings = await getAiSettings(db, teamId);

  if (!settings.ai_analysis_enabled) {
    return {
      allowed: false,
      reason: "AI analysis is turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  if (feature === "documentation" && !settings.ai_documentation_enabled) {
    return {
      allowed: false,
      reason: "AI-generated documentation is turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  if (feature === "automatic_review" && !settings.automatic_reviews_enabled) {
    return {
      allowed: false,
      reason: "Automatic reviews are turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  if (includesWorkflowData && !settings.workflow_data_processing) {
    return {
      allowed: false,
      reason: "Sending workflow data to AI is turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  // Only cloud processing actually exists in this codebase today — no
  // local/self-hosted inference backend is wired up. Rather than silently
  // keep using cloud when the person picked something else, refuse and say
  // so, so the setting isn't quietly lying to them.
  if (settings.processing_location !== "cloud") {
    return {
      allowed: false,
      reason: `Processing location is set to "${settings.processing_location}", but only cloud processing is available right now. Switch it back to Cloud in Settings → AI & Privacy to use AI features.`,
      settings,
    };
  }

  return { allowed: true, settings };
}
