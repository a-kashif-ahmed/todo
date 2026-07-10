// ─────────────────────────────────────────────────────────────
// src/components/import/DirectConnections.tsx
// ─────────────────────────────────────────────────────────────

"use client";

interface ConnectionItem {
  id: string;
  label: string;
}

const connections: ConnectionItem[] = [
  { id: "n8n", label: "Connect n8n" },
  // { id: "zapier", label: "Connect Zapier" },
  // { id: "make", label: "Connect Make" },
];

export default function DirectConnections() {
  function handleConnect(id: string) {
    // UI placeholder for now — wire up OAuth flow in a later phase
    console.log(`Connect clicked: ${id}`);
  }

  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5">
      <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase mb-4">
        Direct Connections
      </p>
      <div className="space-y-2">
        {connections.map(conn => (
          <button
            key={conn.id}
            onClick={() => handleConnect(conn.id)}
            className="w-full flex items-center justify-between bg-surface border border-border-light rounded-lg px-4 py-3 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded bg-surface-3 flex items-center justify-center text-xs text-gray-400">
                {conn.id.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-medium text-white">{conn.label}</span>
            </div>
            <span className="text-gray-500">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}


