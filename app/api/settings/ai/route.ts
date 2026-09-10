// ─────────────────────────────────────────────────────────────
// src/app/api/settings/ai/route.ts
// GET   /api/settings/ai — team's AI & privacy settings
// PATCH /api/settings/ai — update them
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { AISettings, DEFAULT_AI_SETTINGS, getAiSettings } from "@/lib/services/aiSettings";
import { encryptApiKey, maskApiKey } from "@/lib/ai/keyEncryption";
import { createProvider } from "@/lib/ai/provider";

export type { AISettings };

// Strips the encrypted key out of anything sent to the client, replacing
// it with a boolean + masked hint so the UI can show "configured" without
// ever seeing the real value again.
function toClientSettings(settings: AISettings, plainKeyForMasking?: string) {
  const { ai_provider_key_encrypted, ...rest } = settings;
  return {
    ...rest,
    has_api_key: !!ai_provider_key_encrypted,
    api_key_hint: plainKeyForMasking ? maskApiKey(plainKeyForMasking) : undefined,
  };
}

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const settings = await getAiSettings(db, teamId);
  return NextResponse.json({ settings: toClientSettings(settings) });
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
    "ai_provider_endpoint",
    "ai_provider_shape",
    "ai_provider_model",
  ];

  const updates: Partial<AISettings> = {};
  allowed.forEach(k => { if (k in body) (updates as Record<string, unknown>)[k] = body[k]; });

  try {
    const existing = await getAiSettings(db, teamId);
    let merged: AISettings = { ...DEFAULT_AI_SETTINGS, ...existing, ...updates };

    // `ai_provider_api_key` is write-only: plaintext in, encrypted out,
    // never round-tripped back to the client. Only present when the
    // person is actually setting/changing a key.
    const rawKey: string | undefined = body.ai_provider_api_key;
    let plainKeyForMasking: string | undefined;

    if (typeof rawKey === "string" && rawKey.length > 0) {
      // Validate the whole config actually works together before saving
      // anything — a bad endpoint/key/model combo should never silently
      // become "configured".
      const candidate = createProvider({
        endpoint: merged.ai_provider_endpoint || "",
        shape: merged.ai_provider_shape || "openai",
        model: merged.ai_provider_model || "",
        apiKey: rawKey,
      });
      const result = await candidate.validateKey();
      if (!result.valid) {
        return NextResponse.json(
          { error: `Could not connect with these settings: ${result.error || "unknown error"}` },
          { status: 400 }
        );
      }
      merged = { ...merged, ai_provider_key_encrypted: encryptApiKey(rawKey) };
      plainKeyForMasking = rawKey;
    }

    const { error } = await db
      .from("flowlens_teams")
      .update({ ai_settings: merged })
      .eq("id", teamId);

    if (error) throw error;

    return NextResponse.json({ settings: toClientSettings(merged, plainKeyForMasking) });
  } catch (e: unknown) {
    console.error("Saving ai_settings failed:", e);
    const message = e instanceof Error ? e.message : "Could not save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

