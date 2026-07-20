
// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/connections/page.tsx
// Figma: Direct Connections — 3 platform cards + bottom 2 panels
// ─────────────────────────────────────────────────────────────

"use client";
import { useState } from "react";
import { Plus, Eye, EyeOff, Copy, Check } from "lucide-react";

type ConnStatus = "connected" | "setup_needed" | "disconnected";

interface Connection {
  id: string;
  name: string;
  desc: string;
  status: ConnStatus;
  lastSync?: string;
  activeWebhooks?: number;
  latency?: string;
  errorMsg?: string;
}

const conns: Connection[] = [
  { id: "n8n",    name: "n8n.io",           desc: "Self-hosted workflow automation for technical teams.", status: "connected",    lastSync: "2m ago", activeWebhooks: 12, latency: "42ms" },
  { id: "zapier", name: "Zapier",            desc: "Automate work across 5,000+ apps with zero code.",    status: "setup_needed" },
  { id: "make",   name: "Make (Integromat)", desc: "The leading visual automation platform for complex flows.", status: "disconnected", errorMsg: "The API token associated with this account has expired or was revoked. Re-authentication is required." },
];

const statusBadge: Record<ConnStatus, string> = {
  connected:    "text-status-success border-status-success/30 bg-status-success/10",
  setup_needed: "text-status-warning border-status-warning/30 bg-status-warning/10",
  disconnected: "text-status-error border-status-error/30 bg-status-error/10",
};
const statusLabel: Record<ConnStatus, string> = {
  connected:    "● CONNECTED",
  setup_needed: "SETUP NEEDED",
  disconnected: "DISCONNECTED",
};

export default function ConnectionsPage() {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const secret = "fl_live_9438209210482094";

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white">Direct Connections</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-lg">
            Connect FlowLens to your automation orchestrators for real-time observability and deep trace analysis.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-sm bg-surface-2 border border-border rounded-lg px-4 py-2 text-gray-300 hover:border-gray-500 transition-colors">
            ⬇ Export Logs
          </button>
          <button className="flex items-center gap-1.5 text-sm bg-brand-blue text-white font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-opacity">
            <Plus size={14} /> New Integration
          </button>
        </div>
      </div>

      {/* 3 Platform cards */}
      <div className="grid grid-cols-3 gap-4 mt-8 mb-6">
        {conns.map(conn => (
          <div key={conn.id} className="bg-surface-2 border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-base font-bold text-gray-400">
                {conn.name.slice(0, 1)}
              </div>
              <span className={`text-[10px] font-bold tracking-wide border rounded px-2 py-0.5 ${statusBadge[conn.status]}`}>
                {statusLabel[conn.status]}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white mb-1">{conn.name}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">{conn.desc}</p>

            {conn.status === "connected" && (
              <div className="space-y-2 mb-5">
                {[
                  { k: "Last sync", v: conn.lastSync },
                  { k: "Active webhooks", v: String(conn.activeWebhooks) },
                  { k: "Latency", v: conn.latency },
                ].map(r => (
                  <div key={r.k} className="flex justify-between text-xs">
                    <span className="text-gray-500">{r.k}</span>
                    <span className="text-gray-300">{r.v}</span>
                  </div>
                ))}
              </div>
            )}

            {conn.status === "setup_needed" && (
              <div className="bg-surface border border-border rounded-lg p-3 mb-5 space-y-3">
                <p className="text-xs text-gray-500">Required steps to begin observability ingestion from Zapier ecosystem:</p>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] flex items-center justify-center flex-shrink-0">1</span>
                  <div>
                    <p className="text-xs font-semibold text-white">Connect via API</p>
                    <p className="text-[11px] text-gray-500">Authorize the FlowLens OAuth app.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 opacity-50">
                  <span className="w-5 h-5 rounded-full bg-surface border border-border text-gray-500 text-[10px] flex items-center justify-center flex-shrink-0">2</span>
                  <div>
                    <p className="text-xs font-semibold text-white">Define Listeners</p>
                    <p className="text-[11px] text-gray-500">Map your Zaps to FlowLens nodes.</p>
                  </div>
                </div>
              </div>
            )}

            {conn.status === "disconnected" && conn.errorMsg && (
              <div className="bg-status-error/5 border border-status-error/20 rounded-lg p-3 mb-5">
                <p className="text-xs font-semibold text-status-error mb-1">⚠ Connection Failed</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{conn.errorMsg}</p>
              </div>
            )}

            <button className={`w-full text-sm font-medium rounded-lg py-2.5 transition-all ${
              conn.status === "connected"    ? "bg-surface border border-border text-white hover:border-gray-500" :
              conn.status === "setup_needed" ? "bg-status-warning text-black hover:opacity-90" :
              "bg-surface border border-border text-white hover:border-gray-500"
            }`}>
              {conn.status === "connected" ? "Manage" : conn.status === "setup_needed" ? "Configure" : "Re-Authorize"}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Security & Ingestion */}
        <div className="bg-surface-2 border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">🔒</div>
            <div>
              <p className="text-sm font-semibold text-white">Security & Ingestion</p>
              <p className="text-xs text-gray-500">Manage global credentials and secure endpoints.</p>
            </div>
          </div>

          <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Global Webhook Secret</label>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 mb-1">
            <span className="flex-1 text-xs text-gray-300 font-mono">
              {showSecret ? secret : secret.slice(0, 8) + "••••••••••••••"}
            </span>
            <button onClick={() => setShowSecret(s => !s)} className="text-gray-500 hover:text-white transition-colors">
              {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button onClick={copySecret} className="text-gray-500 hover:text-white transition-colors">
              {copied ? <Check size={13} className="text-status-success" /> : <Copy size={13} />}
            </button>
          </div>
          <p className="text-[11px] text-gray-600 mb-4">Use this secret to sign all incoming requests from custom orchestrators.</p>

          <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Whitelisted IP Ranges</label>
          <div className="space-y-1.5">
            {[
              { ip: "35.236.208.0/24", label: "n8n Cloud" },
              { ip: "54.86.9.50",       label: "Production Master" },
            ].map(entry => (
              <div key={entry.ip} className="flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-2">
                <span className="text-xs text-gray-300 font-mono">{entry.ip}</span>
                <span className="text-[10px] bg-surface-2 border border-border rounded px-2 py-0.5 text-gray-400">{entry.label}</span>
              </div>
            ))}
            <button className="text-xs text-brand-blue hover:underline mt-1">+ Add entry</button>
          </div>
        </div>

        {/* AI Health Monitor */}
        <div className="bg-surface-2 border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">✦</div>
              <p className="text-sm font-semibold text-white">AI Health Monitor</p>
            </div>
            <span className="text-[10px] font-bold border border-purple-500/30 text-purple-300 rounded px-2 py-0.5">INTELLIGENT</span>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Our engine has analyzed the last <span className="text-brand-blue font-semibold">14,209 payloads</span> from n8n.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface border border-border rounded-xl px-3 py-3">
              <p className="text-[10px] text-gray-500 mb-1">Optimization</p>
              <p className="text-lg font-bold text-white">94.2%</p>
              <div className="h-1 bg-surface-2 rounded-full mt-2"><div className="h-full bg-brand-blue rounded-full" style={{ width: "94%" }} /></div>
            </div>
            <div className="bg-surface border border-border rounded-xl px-3 py-3">
              <p className="text-[10px] text-gray-500 mb-1">Data Drift</p>
              <p className="text-lg font-bold text-status-success">Low</p>
              <div className="h-1 bg-surface-2 rounded-full mt-2"><div className="h-full bg-status-success rounded-full" style={{ width: "15%" }} /></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-300">◎</span>
              <p className="text-xs font-semibold text-white">Recommendation</p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enable "Compressed Payloads" in n8n Global Settings to reduce ingestion latency by approximately 14ms.
            </p>
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl py-3 transition-colors">
            Apply Auto-Fixes
          </button>
        </div>
      </div>
    </div>
  );
}

