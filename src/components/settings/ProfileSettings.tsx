"use client";
import { useState } from "react";
import { User, Mail, Shield, LogOut } from "lucide-react";
 
interface ProfileSettingsProps {
  displayName: string;
  email: string;
  role: string;
  teamName: string;
}
 
export default function ProfileSettings({ displayName, email, role, teamName }: ProfileSettingsProps) {
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
 
  async function handleSave() {
    setSaving(true);
    // wire up to your API when ready
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
 
  return (
    <div className="max-w-xl space-y-6">
 
      {/* Avatar + name */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-lg font-bold text-brand-blue">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-gray-500">{email}</p>
            <span className="text-[11px] bg-brand-blue/15 text-brand-brand-orangepx-2 py-0.5 rounded mt-1 inline-block capitalize">
              {role}
            </span>
          </div>
        </div>
 
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Display name</label>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5">
              <User size={14} className="text-gray-500" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 opacity-60">
              <Mail size={14} className="text-gray-500" />
              <span className="text-sm text-gray-400">{email}</span>
            </div>
            <p className="text-[11px] text-gray-600 mt-1">Email cannot be changed here.</p>
          </div>
        </div>
 
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 bg-brand-brand-orangetext-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
 
      {/* Team */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Team</h3>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center">
            <Shield size={14} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">{teamName}</p>
            <p className="text-xs text-gray-500 capitalize">{role} · {email}</p>
          </div>
        </div>
      </div>
 
      {/* Danger */}
      <div className="bg-surface-2 border border-status-error/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-status-error mb-3">Danger Zone</h3>
        <button className="flex items-center gap-2 text-sm text-status-error hover:opacity-80 transition-opacity">
          <LogOut size={14} />
          Sign out of all devices
        </button>
      </div>
 
    </div>
  );
}