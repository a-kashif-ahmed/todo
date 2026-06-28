"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", team: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    // 1. Create auth user
    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (authErr || !data.user) { setError(authErr?.message || "Signup failed"); return; }

    // 2. Call our API route to create team + profile
    // (needs service role key so we do it server-side)
    await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: data.user.id,
        displayName: form.name,
        teamName: form.team,
      }),
    });

    router.push("/");
  }

   return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface-2 border border-border rounded-lg p-8">
        <h1 className="text-xl font-semibold mb-6">Sign in to FlowLens</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm" />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm" />
          {error && <p className="text-status-error text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-brand-blue text-white rounded py-2 text-sm font-medium disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-xs text-center text-text-muted mt-4">
          No account? <a href="/signup" className="text-brand-blue">Sign up</a>
        </p>
      </div>
    </div>
  );
}