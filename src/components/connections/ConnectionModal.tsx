"use client";

import { useState } from "react";

interface Props {
    platform: string;
    open: boolean;
    onClose: () => void;
}

export default function ConnectionModal({
    platform,
    open,
    onClose,
}: Props) {

    const [name, setName] = useState("");
    const [baseUrl, setBaseUrl] = useState("");
    const [apiKey, setApiKey] = useState("");

    if (!open) return null;

    async function handleConnect() {

        const res = await fetch("/api/integrations/connect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                platform,
                name,
                baseUrl,
                apiKey
            })
        });

        const json = await res.json();

        if (json.error) {
            alert(json.error);
            return;
        }

        alert("Connected!");

        onClose();
    }

    return (

        <div className="fixed inset-0 text-text-primary bg-black/50 flex items-center justify-center z-50">

            <div className="w-[500px] rounded-xl bg-surface-2 border border-border p-6">

                <h2 className="text-xl font-semibold mb-6">
                    Connect {platform}
                </h2>

                <div className="space-y-4">

                    <input
                        placeholder="Connection Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded border border-border bg-surface px-3 py-2"
                    />

                    <input
                        placeholder="Base URL"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="w-full rounded border border-border bg-surface px-3 py-2"
                    />

                    <input
                        placeholder="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full rounded border border-border bg-surface px-3 py-2"
                    />

                </div>

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-border rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConnect}
                        className="bg-brand-orange rounded px-4 py-2"
                    >
                        Connect
                    </button>

                </div>

            </div>

        </div>

    );
}