import { createClient } from "./server";
import { NextResponse } from "next/server";

export async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles").select("team_id, role").eq("id", user.id).single();

  if (!profile?.team_id)
    return { error: NextResponse.json({ error: "No team" }, { status: 403 }) };

  return { user, teamId: profile.team_id, role: profile.role, supabase };
}

// Usage in any route handler:
// const ctx = await getAuthContext();
// if (ctx.error) return ctx.error;
// const { user, teamId, supabase } = ctx;