  // src/app/(dashboard)/page.tsx
  "use client"
  import AiRecommendation from "@/components/ui/ai-recommendation/page";
  import Card from "@/components/ui/card/page";
  import SystemHealthCard from "@/components/ui/system-health-card/page";
  import RecentActivityFeed from "@/components/ui/recent-activity-feed/page";
  import Link from "next/link";
  import { useState, useEffect } from "react";
  import { History, CheckCircle, AlertTriangle } from "lucide-react";

  export default function Home() {
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
      <div className="flex min-h-screen bg-surface">


        <div className="flex flex-col flex-1">

          <main className="flex-1 p-8 overflow-hidden">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-white">{greeting}</h1>
  <p className="text-inactive text-sm pt-1">
    {incidents.length > 0
      ? `${incidents.length} workflow${incidents.length > 1 ? "s" : ""} need attention.`
      : "All workflows are healthy."}
  </p>
            </div>

            {/* Two-column layout: left = main content, right = sidebar panels */}
            <div className="flex gap-6 h-full">

              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-6 flex-1 min-w-0">

                {/* AI Recommendation banner */}
                <AiRecommendation />

                {/* Workflows section */}
                <div>
                  <div className="flex items-center justify-between mb-2 px-5">
                    <h3 className="text-white font-medium">Your workflows</h3>
                    <Link href="/workflows" className="text-sm text-white hover:underline">
                      View all
                    </Link>
                  </div>

                  {loading ? (
    <p className="text-gray-500 text-sm px-5">Loading workflows...</p>
  ) : (
  <div className="grid grid-cols-2 "> 
                    {[...workflows].slice(0,3)
    .sort((a, b) => {
      const priority:Record<string, number> = { failing: 0, degraded: 1, unknown: 2, healthy: 3 };
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
                </div>
              </div>

              {/* RIGHT COLUMN */}
      <div className="w-72 flex-shrink-0 overflow-y-auto pr-2">
  <RecentActivityFeed />
  <SystemHealthCard />
</div>

            </div>
          </main>
        </div>
      </div>
    );
  }