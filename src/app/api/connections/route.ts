import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET() {
  const ctx = await getAuthContext();

  if (ctx.error) return ctx.error;

  const { db, user, teamId } = ctx;

  const { data, error } = await db
    .from("flowlens_connections")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    connections: data.map((c) => ({
      id: c.id,
      name: c.platform,
      desc: c.description,
      status: c.status,
      lastSync: c.last_sync
        ? new Date(c.last_sync).toLocaleString()
        : null,
      activeWebhooks: c.active_webhooks,
      latency: c.latency_ms ? `${c.latency_ms}ms` : null,
      errorMsg: c.error_message,
      secret: c.api_key,
    })),
  });
}