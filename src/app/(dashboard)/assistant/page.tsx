"use client";

import Card from "@/components/ui/card/page";
import { Plus, Clock3 } from "lucide-react";

export default function AssistantPage() {
  // TODO: Replace with API response
  const assistants = [
    {
      id: 1,
      title: "Sales Assistant",
      description:
        "Qualifies inbound leads and drafts personalized follow-up emails.",
      status: {
        label: "Healthy",
        color: "success" as const,
      },
      lastUpdated: "Updated 2 hours ago",
    },
    {
      id: 2,
      title: "Support Assistant",
      description:
        "Answers customer questions using your internal knowledge base.",
      status: {
        label: "Warning",
        color: "warning" as const,
      },
      lastUpdated: "Updated yesterday",
    },
    {
      id: 3,
      title: "Marketing Assistant",
      description:
        "Generates social media content and campaign ideas automatically.",
      status: {
        label: "Offline",
        color: "error" as const,
      },
      lastUpdated: "Updated 3 days ago",
    },
  ];

  return (
    <main className="min-h-screen bg-surface px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            AI Assistants
          </h1>

          <p className="mt-2 text-inactive">
            Manage and monitor your AI assistants.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
          <Plus size={18} />
          New Assistant
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search assistants..."
          className="w-full max-w-md rounded-md border border-default bg-surface-2 px-4 py-3 text-white placeholder:text-inactive focus:outline-none"
        />
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Create Card */}
        <Card
          variant="create"
          
        />

        {/* Assistant Cards */}
        {assistants.map((assistant) => (
          <Card
            key={assistant.id}
            title={assistant.title}
            description={assistant.description}
            status={assistant.status}
            footer={
              <>
                <Clock3 size={14} />
                <span>{assistant.lastUpdated}</span>
              </>
            }
            button={{
              label: "Open Assistant",
              color: "success",
              
            }}
          />
        ))}
      </div>
    </main>
  );
}