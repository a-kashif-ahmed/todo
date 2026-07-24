import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import {
  testN8nConnection,
  getN8nWorkflows,
} from "@/lib/connections/n8n";

export async function POST(request: Request) {
  try {
    const ctx = await getAuthContext();

    if (ctx.error) return ctx.error;

    const { db, user } = ctx;

    const {
      platform,
      name,
      baseUrl,
      apiKey,
    } = await request.json();

    if (
      !platform ||
      !name ||
      !baseUrl ||
      !apiKey
    ) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { data: profile } = await db
      .from("flowlens_profiles")
      .select("team_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (platform === "n8n") {
      await testN8nConnection(
        baseUrl,
        apiKey
      );
    }

    const { data: integration, error } =
      await db
        .from("flowlens_platforms")
        .insert({
          team_id: profile.team_id,
          platform,
          name,
          base_url: baseUrl,
          api_key: apiKey,
          status: "connected",
          last_sync: new Date(),
        })
        .select()
        .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (platform === "n8n") {
      const workflows =
        await getN8nWorkflows(
          baseUrl,
          apiKey
        );

      const rows = workflows.map((workflow) => ({
        team_id: profile.team_id,
        external_id: workflow.id,
        platform: "n8n",
        name: workflow.name,
        status: workflow.active
          ? "healthy"
          : "disabled",
      }));

      if (rows.length > 0) {
        await db
          .from("flowlens_workflows")
          .upsert(rows, {
            onConflict: "external_id",
          });
      }
    }

    return NextResponse.json({
      success: true,
      integration,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Connection failed",
      },
      { status: 500 }
    );
  }
}