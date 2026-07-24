"use client"
import AiRecommendation from "@/components/ui/ai-recommendation/page";
import Card from "@/components/ui/card/page";
import SystemHealthCard from "@/components/ui/system-health-card/page";
import RecentActivityFeed from "@/components/ui/recent-activity-feed/page";
import Link from "next/link";
import { useState, useEffect } from "react";
import { History, CheckCircle, AlertTriangle } from "lucide-react";

export default function AllWorkflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<any[]>([]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";

  useEffect(() => {
    Promise.all([
      fetch("/api/workflows").then(r => r.json()),
      fetch("/api/incidents?status=open").then(r => r.json()),
    ]).then(([wfData, incData]) => {
      setWorkflows(wfData.workflows || []);
      setIncidents(incData.incidents || []);
      setLoading(false);
    });
  }, []);
  return (
    <div className="flex min-h-screen bg-surface  ">


      <div className="flex flex-col flex-1">

        <main className="flex-1 p-8  ">
            {loading ? (
                              <p className="text-text-muted text-sm px-5">Loading workflows...</p>
                            ) : (
                              <div className="grid grid-cols-2 ">
                                {[...workflows]
                                  .sort((a, b) => {
                                    const priority: Record<string, number> = { failing: 0, degraded: 1, unknown: 2, healthy: 3 };
                                    return (priority[a.status] ?? 2) - (priority[b.status] ?? 2);
                                  }).map(wf => {
                                    const hasIncident = incidents.some(i => i.workflow_id === wf.id);
                                    return (
                                      <Card
                                        key={wf.id}
                                        title={wf.name}
                                        description={wf.platform}
                                        href={`/workflows/${wf.id}`}
                                        status={{
                                          label: wf.status === "failing" ? "Needs Attention" : "Healthy",
                                          color: wf.status === "failing" ? "error" : "success",
                                        }}
                                        button={hasIncident ? {
                                          label: "Investigate",
                                          color: "error",
                                          icon: <AlertTriangle size={14} />,
                                        } : undefined}
                                        footer={!hasIncident ? (
                                          <span className="flex items-center gap-1.5">
                                            <History size={14} />
                                            {wf.last_snapshot_at
                                              ? `Last seen ${new Date(wf.last_snapshot_at).toLocaleString()}`
                                              : "No snapshots yet"}
                                          </span>
                                        ) : undefined}
                                      />
                                    );
                                  })}
                                <Card variant="create" href="/workflows" />
                              </div>
                            )}
        </main>
        </div>
        </div>
  ) 

}