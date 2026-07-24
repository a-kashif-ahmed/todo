"use client";

import { CheckCircle2, AlertCircle, PlugZap } from "lucide-react";

interface Props {
  platform: string;
  description: string;
  connected: boolean;
  lastSync?: string;
  onConnect: () => void;
}

export default function ConnectionCard({
  platform,
  description,
  connected,
  lastSync,
  onConnect,
}: Props) {
  return (
    <div className="rounded-xl  border border-border bg-surface-2 p-6">

      <div className="flex justify-between items-start">

        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {platform}
          </h3>

          <p className="text-sm text-text-muted mt-1">
            {description}
          </p>
        </div>

        {connected ? (
          <span className="flex items-center gap-2 text-status-success text-sm">
            <CheckCircle2 size={16} />
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-2 text-status-error text-sm">
            <AlertCircle size={16} />
            Not Connected
          </span>
        )}

      </div>

      {connected && (
        <p className="text-xs text-text-muted mt-5">
          Last Sync
          <br />
          {lastSync}
        </p>
      )}

      <button
        onClick={onConnect}
        className="mt-6 flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm text-white hover:opacity-90"
      >
        <PlugZap size={15} />
        {connected ? "Manage" : "Connect"}
      </button>

    </div>
  );
}