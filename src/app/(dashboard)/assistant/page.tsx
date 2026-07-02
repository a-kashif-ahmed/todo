"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock3 } from "lucide-react";
import Card from "@/components/ui/card/page";

interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
  last_snapshot_at: string | null;
}

const statusMap = {
  healthy: {
    label: "Healthy",
    color: "success" as const,
  },
  degraded: {
    label: "Warning",
    color: "warning" as const,
  },
  failing: {
    label: "Offline",
    color: "error" as const,
  },
  unknown: {
    label: "Unknown",
    color: "warning" as const,
  },
};

export default function AssistantPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/workflows");
        const data = await res.json();

        setWorkflows(data.workflows ?? []);
        console.log(data.workflows)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="p-8 text-inactive">
        <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            AI Assistants
          </h1>

          <p className="text-inactive mt-2">
            Monitor and manage your workflow assistants.
          </p>
          Loading Assistants....
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            AI Assistants
          </h1>

          <p className="text-inactive mt-2">
            Monitor and manage your workflow assistants.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-white">
          <Plus size={18} />
          New Assistant
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <Card variant="create" />

        {workflows.map((workflow) => (
          <Card
            key={workflow.id}
            title={workflow.name}
            description={`Platform: ${workflow.platform}`}
            status={statusMap[workflow.status]}
            href={`/assistant/${workflow.id}`}
            footer={
              <div className="flex items-center gap-2">
                <Clock3 size={14} />
                <span>
                  {workflow.last_snapshot_at
                    ? new Date(
                        workflow.last_snapshot_at
                      ).toLocaleString()
                    : "No snapshots"}
                </span>
              </div>
            }
            button={{
              label: "Chat",
              color: "warning",
            }}
          />
        ))}
      </div>
    </main>
  );
}