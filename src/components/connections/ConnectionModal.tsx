// components/connections/ConnectionModal.tsx
"use client";

import { useState } from "react";

interface Props {
  platform: string; // "n8n" | "make" | "zapier"
  open: boolean;
  onClose: () => void;
  onConnected: () => void; // parent refetches the connections list
}

export default function ConnectionModal({ platform, open, onClose, onConnected }: Props) {
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [makeTeamId, setMakeTeamId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const isZapier = platform === "zapier";
  const isMake = platform === "make";

  async function handleConnect() {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/connections/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          name: name || platform,
          baseUrl: isZapier ? undefined : baseUrl,
          apiKey: isZapier ? undefined : apiKey,
          makeTeamId: isMake ? makeTeamId : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Connection failed");
        return;
      }

      if (isZapier && json.webhookUrl) {
        // Zapier has nothing to "test",show the webhook URL to paste into
        // their Zap instead of closing immediately.
        setWebhookUrl(json.webhookUrl);
        return;
      }

      onConnected();
      resetForm();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setBaseUrl("");
    setApiKey("");
    setMakeTeamId("");
    setWebhookUrl("");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 text-text-primary bg-black/50 flex items-center justify-center z-50">
      <div className="w-[500px] rounded-xl bg-surface-2 border border-border p-6">
        <h2 className="text-xl font-semibold mb-6 capitalize">Connect {platform}</h2>

        {/* Zapier: show the webhook URL once generated, nothing else to fill in */}
        {isZapier && webhookUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Add a &quot;Webhooks by Zapier&quot; action as the last step of each Zap
              you want monitored, pointed at this URL:
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={webhookUrl}
                className="flex-1 rounded border border-border bg-surface px-3 py-2 text-xs text-text-muted"
              />
              <button
                onClick={copyWebhookUrl}
                className="rounded border border-border px-3 py-2 text-xs hover:border-brand-orange/40"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  onConnected();
                  resetForm();
                }}
                className="bg-brand-orange rounded px-4 py-2 text-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <input
                placeholder="Connection Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-border bg-surface px-3 py-2"
              />

              {!isZapier && (
                <>
                  <input
                    placeholder={isMake ? "Zone URL (e.g. https://eu1.make.com)" : "Base URL"}
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full rounded border border-border bg-surface px-3 py-2"
                  />

                  <input
                    placeholder={isMake ? "API Token" : "API Key"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded border border-border bg-surface px-3 py-2"
                  />
                </>
              )}

              {isMake && (
                <input
                  placeholder="Make Team ID"
                  value={makeTeamId}
                  onChange={(e) => setMakeTeamId(e.target.value)}
                  className="w-full rounded border border-border bg-surface px-3 py-2"
                />
              )}

              {isZapier && (
                <p className="text-sm text-text-muted">
                  No credentials needed,we&apos;ll generate a webhook URL for you
                  to paste into your Zaps after you click Connect.
                </p>
              )}
            </div>

            {error && (
              <p className="mt-4 text-sm text-status-error">{error}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleConnect}
                disabled={submitting}
                className="bg-brand-orange rounded px-4 py-2 disabled:opacity-50"
              >
                {submitting ? "Connecting..." : "Connect"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
