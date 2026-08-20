// ─────────────────────────────────────────────────────────────
// src/app/api/settings/ai/route.ts
// GET   /api/settings/ai — team's AI & privacy settings
// PATCH /api/settings/ai — update them
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { AISettings, DEFAULT_AI_SETTINGS, getAiSettings } from "@/lib/services/aiSettings";

export type { AISettings };

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const settings = await getAiSettings(db, teamId);
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const body = await request.json();
  const allowed: (keyof AISettings)[] = [
    "ai_analysis_enabled",
    "workflow_data_processing",
    "ai_documentation_enabled",
    "automatic_reviews_enabled",
    "privacy_mode",
    "processing_location",
  ];

  const updates: Partial<AISettings> = {};
  allowed.forEach(k => { if (k in body) (updates as Record<string, unknown>)[k] = body[k]; });

  try {
    const existing = await getAiSettings(db, teamId);
    const merged = { ...DEFAULT_AI_SETTINGS, ...existing, ...updates };

    const { error } = await db
      .from("flowlens_teams")
      .update({ ai_settings: merged })
      .eq("id", teamId);

    if (error) throw error;

    return NextResponse.json({ settings: merged });
  } catch (e: unknown) {
    console.error("Saving ai_settings failed (column may not exist yet):", e);
    return NextResponse.json(
      { error: "Could not save settings — the ai_settings column may not exist yet on flowlens_teams." },
      { status: 500 }
    );
  }
}

