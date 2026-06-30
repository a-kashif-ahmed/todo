// ─────────────────────────────────────────────────────────────
// src/components/import/TrustBadges.tsx
// ─────────────────────────────────────────────────────────────

import { ShieldCheck, History, GitBranch } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, label: "End-to-end encryption active" },
    { icon: History, label: "Auto-versioning enabled" },
    { icon: GitBranch, label: "Supports OpenAPI v3 & JSON Schema" },
  ];

  return (
    <div className="flex items-center justify-center gap-8 mt-8">
      {badges.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-2 text-xs text-gray-500">
          <Icon size={13} />
          {label}
        </span>
      ))}
    </div>
  );
}


