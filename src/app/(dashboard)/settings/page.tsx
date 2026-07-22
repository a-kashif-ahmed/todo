
// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/settings/page.tsx
// Figma: Profile Settings — left tab nav + right form
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Shield, Key, GitBranch, LogOut, Edit2, Copy, Check } from "lucide-react";

type SettingsTab = "General" | "Security" | "API Keys" | "Integrations";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("General");
  const [profile, setProfile] = useState<{ display_name: string; email: string; role: string; team_name: string } | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase
        .from("flowlens_profiles")
        .select("display_name, role, team_id, flowlens_teams(name)")
        .eq("id", user.id)
        .single();
      if (p) {
        const teamName = (p as any).flowlens_teams?.name || "My Team";
        setProfile({ display_name: p.display_name || "", email: user.email || "", role: p.role, team_name: teamName });
        setName(p.display_name || "");
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("flowlens_profiles").update({ display_name: name }).eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function copyId() {
    navigator.clipboard.writeText(profile?.team_name || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const tabs: { id: SettingsTab; icon: React.ReactNode }[] = [
    { id: "General",      icon: <User size={14} /> },
    { id: "Security",     icon: <Shield size={14} /> },
    { id: "API Keys",     icon: <Key size={14} /> },
    { id: "Integrations", icon: <GitBranch size={14} /> },
  ];

  return (
    <div className="p-8">
      {/* Profile hero */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue to-purple-500 flex items-center justify-center text-2xl font-bold text-text-primary">
              {(profile?.display_name || "?").slice(0, 1).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center border-2 border-surface">
              <Edit2 size={10} className="text-text-primary" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{profile?.display_name || "—"}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-xs bg-surface border border-border rounded-full px-2.5 py-1 text-text-muted">
                <Shield size={11} /> System Admin
              </span>
              <span className="flex items-center gap-1 text-xs bg-brand-blue/15 border border-brand-blue/25 rounded-full px-2.5 py-1 text-brand-blue">
                ● Pro Plan
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-sm text-text-muted bg-surface-2 border border-border rounded-lg px-4 py-2 hover:text-text-primary hover:border-gray-500 transition-colors">
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium bg-brand-blue text-text-primary rounded-lg px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left tab nav */}
        <div className="w-44 space-y-1 flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? "bg-surface-2 text-text-primary border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.icon} {t.id}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 max-w-2xl">
          {tab === "General" && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text-muted mb-4">General Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Full Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-blue/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Email Address</label>
                  <input
                    value={profile?.email || ""}
                    disabled
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-muted outline-none cursor-not-allowed opacity-60"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Workspace Name</label>
                <div className="flex items-center gap-2">
                  <input
                    value={profile?.team_name || ""}
                    disabled
                    className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-gray-300 outline-none cursor-not-allowed"
                  />
                  <button
                    onClick={copyId}
                    className="flex items-center gap-1.5 text-sm bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-muted hover:text-text-primary hover:border-gray-500 transition-colors whitespace-nowrap"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    Copy ID
                  </button>
                </div>
              </div>

              {/* Danger */}
              <div className="mt-8 border-t border-border pt-6">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-status-error hover:opacity-80 transition-opacity"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}

          {tab === "Security" && (
            <div className="bg-surface-2 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Security</h3>
              <p className="text-sm text-text-muted">Password changes and MFA settings coming soon.</p>
            </div>
          )}

          {tab === "API Keys" && (
            <div className="bg-surface-2 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">API Keys</h3>
              <p className="text-sm text-text-muted">API key management coming soon.</p>
            </div>
          )}

          {tab === "Integrations" && (
            <div className="bg-surface-2 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Integrations</h3>
              <p className="text-sm text-text-muted">
                Connect n8n, Zapier, and Make from the{" "}
                <a href="/connections" className="text-brand-blue hover:underline">Connections page</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


