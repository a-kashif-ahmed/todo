// ============================================================
// FILE 1: src/app/(dashboard)/assistant/page.tsx
// Index — lists all workflows, user picks one to chat about
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import Card from "@/components/ui/card/page";
interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
}

export default function AssistantIndexPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/workflows")
      .then(r => r.json())
      .then(data => {
        setWorkflows(data.workflows || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">AI Assistant</h1>
        <p className="text-sm text-gray-500">
          Select a workflow to start a debugging session with FlowLens AI.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading workflows...</p>
      ) : (
        <div className="grid grid-cols-2 ">
          {[...workflows]
  .sort((a, b) => {
    const priority = { failing: 0, degraded: 1, unknown: 2, healthy: 3 };
    return (priority[a.status] ?? 2) - (priority[b.status] ?? 2);
  }).map(wf => (
             <Card
                                    key={wf.id}
                                    title={wf.name}
                                    description={wf.platform}
                                    href={`/assistant/${wf.id}`}
                                    status={{
                                      label: wf.status === "failing" ? "Needs Attention" : "Healthy",
                                      color: wf.status === "failing" ? "error" : "success",
                                    }}
                                    button={ {label: wf.status === "failing" ? "Fix with Assistant" : "Chat with Assistant",
                                      color: wf.status === "failing" ? "error" : "success",}}
                                  />
          ))}

          {workflows.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No workflows yet.{" "}
              <a href="/import" className="text-brand-orange hover:underline">Import one</a> to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


