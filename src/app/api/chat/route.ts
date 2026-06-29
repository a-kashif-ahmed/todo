// ─────────────────────────────────────────────────────────────
// src/app/api/ai/chat/route.ts
// POST /api/ai/chat — streaming AI assistant
// ─────────────────────────────────────────────────────────────

import { getAuthContext } from "@/lib/supabase/auth-helper";
import { createChatStream } from "@/lib/services/ai";
import { NextResponse } from "next/server";

// Simple in-memory rate limiter (upgrade to Upstash Redis in production)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(userId: string, max = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (rateLimitMap.get(userId) || []).filter(t => now - t < windowMs);
  if (hits.length >= max) return true;
  rateLimitMap.set(userId, [...hits, now]);
  return false;
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user } = ctx;

  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Wait a minute." },
      { status: 429 }
    );
  }

  const { messages, context = "" } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  try {
    return await createChatStream(messages, context);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


