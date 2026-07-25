// src/app/api/connections/connect/route.ts
// REPLACES your current file entirely. Only the final return block changed —
// everything else is identical to what you already have.

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { testN8nConnection, getN8nWorkflows } from "@/lib/connections/n8n";
import { testMakeConnection, getMakeScenarios } from "@/lib/connections/make";
import { generateWebhookSecret, buildZapierWebhookUrl } from "@/lib/connections/zapier";

export async function POST(request: Request) {
  try {
    const ctx = await getAuthContext();
    if (ctx.error) return ctx.error;
    const { db, user } = ctx;

    const { platform, name, baseUrl, apiKey, makeTeamId } = await request.json();

    if (!platform || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (platform !== "zapier" && (!baseUrl || !apiKey)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (platform === "make" && !makeTeamId) {
      return NextResponse.json({ error: "Make team ID is required" }, { status: 400 });
    }

    const { data: profile } = await db
      .from("flowlens_profiles")
      .select("team_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (platform === "n8n") {
      await testN8nConnection(baseUrl, apiKey);
    } else if (platform === "make") {
      await testMakeConnection(baseUrl, apiKey, makeTeamId);
    }

    const webhookSecret = platform === "zapier" ? generateWebhookSecret() : null;

    const { data: integration, error } = await db
      .from("flowlens_platforms")
      .insert({
        team_id: profile.team_id,
        platform,
        name,
        base_url: platform === "zapier" ? null : baseUrl,
        api_key: platform === "zapier" ? null : apiKey,
        external_team_id: platform === "make" ? makeTeamId : null,
        webhook_secret: webhookSecret,
        status: "connected",
        last_sync: new Date(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (platform === "n8n") {
      const workflows = await getN8nWorkflows(baseUrl, apiKey);

      const rows = workflows.map((workflow) => ({
        team_id: profile.team_id,
        external_id: workflow.id,
        platform: "n8n",
        name: workflow.name,
        status: workflow.active ? "healthy" : "disabled",
      }));

      if (rows.length > 0) {
        await db.from("flowlens_workflows").upsert(rows, { onConflict: "external_id" });
      }
    } else if (platform === "make") {
      const scenarios = await getMakeScenarios(baseUrl, apiKey, makeTeamId);

      const rows = scenarios.map((s) => ({
        team_id: profile.team_id,
        external_id: String(s.id),
        platform: "make",
        name: s.name,
        status: s.isActive ? "healthy" : "disabled",
      }));

      if (rows.length > 0) {
        await db.from("flowlens_workflows").upsert(rows, { onConflict: "external_id" });
      }
    }

    // FIX: was `integration` (full row — includes api_key, base_url,
    // webhook_secret). Only return what the UI actually needs.
    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        platform: integration.platform,
        name: integration.name,
        status: integration.status,
        last_sync: integration.last_sync,
      },
      webhookUrl:
        platform === "zapier"
          ? buildZapierWebhookUrl(profile.team_id, webhookSecret!)
          : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Connection failed" },
      { status: 500 }
    );
  }
}
