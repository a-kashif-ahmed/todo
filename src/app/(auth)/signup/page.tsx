"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", team: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authErr || !data.user) {
      setError(authErr?.message || "Signup failed");
      setLoading(false);
      return;
    }

    await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: data.user.id,
        displayName: form.name,
        teamName: form.team,
      }),
    });

    setLoading(false);
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface-2 border border-border rounded-lg p-8">
        <h1 className="text-xl font-semibold text-white mb-1">Create your account</h1>
        <p className="text-xs text-gray-400 mb-6">Start debugging your automations</p>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand-blue/50"
          />
          <input
            type="text"
            placeholder="Team name"
            value={form.team}
            onChange={e => setForm(prev => ({ ...prev, team: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand-blue/50"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand-blue/50"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand-blue/50"
          />

          {error && <p className="text-status-error text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue text-white rounded py-2 text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-brand-blue hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}