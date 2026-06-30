// src/app/(dashboard)/page.tsx
"use client"
import AiRecommendation from "@/components/ui/ai-recommendation/page";
import Card from "@/components/ui/card/page";
import Navbar from "@/components/ui/navbar/page";
import Sidebar from "@/components/ui/sidebar/page";
import SystemHealthCard from "@/components/ui/system-health-card/page";
import RecentActivityFeed from "@/components/ui/recent-activity-feed/page";
import Link from "next/link";
import { History, CheckCircle, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-surface">
      

      <div className="flex flex-col flex-1">
        
        <main className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-white">Good morning.</h1>
            <p className="text-inactive text-sm pt-1">
              Your automation engine is humming. 1 alert requires attention.
            </p>
          </div>

          {/* Two-column layout: left = main content, right = sidebar panels */}
          <div className="flex gap-6">

            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6 flex-1 min-w-0">

              {/* AI Recommendation banner */}
              <AiRecommendation />

              {/* Workflows section */}
              <div>
                <div className="flex items-center justify-between mb-2 px-5">
                  <h3 className="text-white font-medium">Your workflows</h3>
                  <Link href="/workflows" className="text-sm text-accent hover:underline">
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-2 ">
                  <Card
                    title="Lead Capture"
                    description="Last modified 2 hours ago"
                    status={{ label: "Healthy", color: "success" }}
                    footer={
                      <span className="flex items-center gap-1.5">
                        <History size={14} />
                        Running every 5 mins
                      </span>
                    }
                  />
                  <Card
                    title="CRM Sync"
                    description="Critical error detected in Node 4"
                    status={{ label: "Needs Attention", color: "error" }}
                    button={{
                      label: "Investigate",
                      color: "error",
                      icon: <AlertTriangle size={14} />,
                    }}
                  />
                  <Card
                    title="Email Automation"
                    description="Last modified yesterday"
                    status={{ label: "Healthy", color: "success" }}
                    footer={
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} />
                        1,240 events processed today
                      </span>
                    }
                  />
                  <Card variant="create" onClick={() => console.log("create")} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6 w-72 flex-shrink-0">
              <RecentActivityFeed/>
              <SystemHealthCard />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}