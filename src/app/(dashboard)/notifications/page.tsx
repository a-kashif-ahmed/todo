
// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/notifications/page.tsx
// Figma: Notifications screen — left feed + right health panel
// ─────────────────────────────────────────────────────────────

"use client";
import { useState } from "react";
import { AlertTriangle, Info, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import { NotificationItem } from "@/components/notifications/NotificationItem";

type Tab = "All" | "Critical" | "Warnings" | "System";

const mockNotifications = [
  {
    id: "1",
    type: "error" as const,
    title: "Schema Mismatch Detected in Shopify Sync",
    description: `The "Order-Finalize" node failed to parse the incoming payload from Shopify webhook. Expected Integer, received String. Pipeline halted to prevent data corruption.`,
    time: "Today",
    unread: true,
    actions: [
      { label: "Investigate", href: "/investigate", primary: true },
      { label: "Mark as Read", href: "#" },
    ],
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Rate Limit Warning: OpenAI API",
    description: `Workflow "Email-Triage-Pro" has reached 85% of its tier rate limit. Consider upgrading to avoid 429 status codes in the next hour.`,
    time: "Today",
    unread: true,
    actions: [
      { label: "View Details", href: "#", primary: false },
      { label: "Mark as Read", href: "#" },
    ],
  },
  {
    id: "3",
    type: "info" as const,
    title: "Optimization Suggestion Available",
    description: `FlowLens AI analyzed your "Monthly Reporting" flow. By collapsing three parallel jobs into a single batch node, you could reduce latency by 140ms and compute costs by 12%.`,
    time: "Today",
    unread: true,
    actions: [
      { label: "Apply Suggestion", href: "#", primary: true },
      { label: "Dismiss", href: "#" },
    ],
  },
  {
    id: "4",
    type: "success" as const,
    title: "System Update Successful",
    description: "FlowLens Core v2.4.1 has been deployed. New features include bulk-node-editing and expanded Make support. Check the changelog for details.",
    time: "Earlier this week",
    unread: false,
    actions: [{ label: "Read Changelog", href: "#" }],
  },
  {
    id: "5",
    type: "warning" as const,
    title: "PostgreSQL Storage at 75% Capacity",
    description: "The log retention database is nearing its 50GB limit. Automated pruning of logs older than 30 days is recommended to maintain optimal query performance.",
    time: "Oct 23, 04:30 PM",
    unread: false,
    actions: [{ label: "Configure Pruning", href: "#" }],
  },
];

const tabFilter: Record<Tab, string[]> = {
  All:      ["error", "warning", "success", "info"],
  Critical: ["error"],
  Warnings: ["warning"],
  System:   ["info", "success"],
};

const typeIcon = {
  error:   <div className="w-8 h-8 rounded-full bg-status-error/15 border border-status-error/30 flex items-center justify-center"><AlertTriangle size={14} className="text-status-error" /></div>,
  warning: <div className="w-8 h-8 rounded-full bg-status-warning/15 border border-status-warning/30 flex items-center justify-center"><AlertTriangle size={14} className="text-status-warning" /></div>,
  info:    <div className="w-8 h-8 rounded-full bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center"><Zap size={14} className="text-purple-400" /></div>,
  success: <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center"><Info size={14} className="text-brand-orange" /></div>,
};

const borderByType = {
  error:   "border-l-4 border-l-status-error",
  warning: "border-l-4 border-l-status-warning",
  info:    "border-l-4 border-l-purple-500",
  success: "border-l-4 border-l-transparent",
};

const commonIssues = [
  { label: "API Rate Limits",  badge: "Frequent", badgeColor: "bg-status-warning/20 text-status-warning" },
  { label: "Schema Mismatches", badge: "Critical", badgeColor: "bg-status-error/20 text-status-error" },
  { label: "Auth Token Expiry", badge: "Occasional", badgeColor: "bg-brand-blue/20 text-brand-orange" },
];

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("All");

  const filtered = mockNotifications.filter(n =>
    tabFilter[tab].includes(n.type)
  );

  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach(n => {
    (grouped[n.time] = grouped[n.time] || []).push(n);
  });

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Notification feed ── */}
      <div className="flex-1 overflow-y-auto p-8 pr-6 scrollbar ">
        <h1 className="text-3xl font-bold text-text-primary mb-1">Notifications</h1>
        <p className="text-sm text-text-muted mb-6 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-status-error" />
          You have {unreadCount} unread alerts requiring attention.
        </p>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-surface-2 border border-border rounded-lg p-1 w-fit mb-8">
          {(["All", "Critical", "Warnings", "System"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm px-5 py-1.5 rounded transition-colors ${
                tab === t ? "bg-surface text-text-primary font-medium" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grouped notifications */}
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-8">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">{date}</p>
            <div className="space-y-3">
              {items.map(n => (
                <div
                  key={n.id}
                  className={`bg-surface-2 border border-border rounded-xl overflow-hidden ${borderByType[n.type]}`}
                >
                  <div className="flex gap-4 p-5">
                    <div className="flex-shrink-0 mt-0.5">{typeIcon[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary mb-1">{n.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed mb-4">{n.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        {n.actions.map((a, i) => (
                          <Link
                            key={i}
                            href={a.href}
                            className={`text-sm font-medium rounded-lg px-4 py-1.5 transition-colors ${
                              a.href
                                ? "bg-brand-blue text-text-primary hover:opacity-90"
                                : "bg-surface border border-border text-text-primary hover:border-gray-500"
                            }`}
                          >
                            {a.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── RIGHT: Notification Health sidebar ── */}
      <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto p-6 space-y-5 scrollbar">
        <h2 className="text-base font-semibold text-text-primary">Notification Health</h2>

        {/* Uptime donut */}
        <div className="bg-surface-2 border border-border rounded-xl flex items-center justify-center py-8">
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1c2230" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10"
                strokeDasharray={`${0.92 * 251.2} ${251.2}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-text-primary">92%</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wide">UPTIME</span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Summary Statistics</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-2 border border-border rounded-lg px-3 py-3">
              <p className="text-[10px] text-text-muted uppercase">Total Alerts</p>
              <p className="text-xl font-bold text-text-primary">1,204</p>
            </div>
            <div className="bg-surface-2 border border-border rounded-lg px-3 py-3">
              <p className="text-[10px] text-text-muted uppercase">Avg Resolve</p>
              <p className="text-xl font-bold text-text-primary">14m</p>
            </div>
          </div>
        </div>

        {/* Common issues */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Common Issues</p>
          <div className="space-y-2">
            {commonIssues.map(issue => (
              <div key={issue.label} className="flex items-center justify-between bg-surface-2 border border-border rounded-lg px-3 py-2.5">
                <span className="text-sm text-text-muted">{issue.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${issue.badgeColor}`}>{issue.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart filtering */}
        <div className="bg-purple-900/20 border border-purple-500/25 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-300 mb-2">✦ Smart Filtering Active</p>
          <p className="text-xs text-text-muted leading-relaxed">
            AI is currently suppressing 12 repetitive noise notifications from the "Staging" environment to keep your focus on production.
          </p>
        </div>
      </div>
    </div>
  );
}

