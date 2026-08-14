// ─────────────────────────────────────────────────────────────
// src/app/api/settings/ai/route.ts
// GET   /api/settings/ai — team's AI & privacy settings
// PATCH /api/settings/ai — update them
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export interface AISettings {
  ai_analysis_enabled: boolean;
  workflow_data_processing: boolean;
  ai_documentation_enabled: boolean;
  automatic_reviews_enabled: boolean;
  privacy_mode: "standard" | "strict";
  processing_location: "cloud" | "local" | "self_hosted";
}

const DEFAULT_SETTINGS: AISettings = {
  ai_analysis_enabled: true,
  workflow_data_processing: true,
  ai_documentation_enabled: true,
  automatic_reviews_enabled: false,
  privacy_mode: "standard",
  processing_location: "cloud",
};

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  try {
    const { data, error } = await db
      .from("flowlens_teams")
      .select("ai_settings")
      .eq("id", teamId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      settings: { ...DEFAULT_SETTINGS, ...(data?.ai_settings || {}) },
    });
  } catch (e) {
    // `ai_settings` column may not exist yet (pre-migration) — fall back to
    // defaults rather than failing the whole settings page.
    console.error("Loading ai_settings failed, using defaults:", e);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
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
  allowed.forEach(k => { if (k in body) (updates as any)[k] = body[k]; });

  try {
    const { data: existing } = await db
      .from("flowlens_teams")
      .select("ai_settings")
      .eq("id", teamId)
      .single();

    const merged = { ...DEFAULT_SETTINGS, ...(existing?.ai_settings || {}), ...updates };

    const { error } = await db
      .from("flowlens_teams")
      .update({ ai_settings: merged })
      .eq("id", teamId);

    if (error) throw error;

    return NextResponse.json({ settings: merged });
  } catch (e: any) {
    console.error("Saving ai_settings failed (column may not exist yet):", e);
    return NextResponse.json(
      { error: "Could not save settings — the ai_settings column may not exist yet on flowlens_teams." },
      { status: 500 }
    );
  }
}
