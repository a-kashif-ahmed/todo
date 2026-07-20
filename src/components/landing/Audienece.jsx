"use client";

import {
  Bot,
  Workflow,
  Building2,
  Users,
  Rocket,
  Cpu,
  Briefcase,
  Network,
  Database,
} from "lucide-react";

const audience = [
  {
    icon: Workflow,
    title: "Automation Engineers",
  },
  {
    icon: Bot,
    title: "AI Workflow Builders",
  },
  {
    icon: Rocket,
    title: "Startup Teams",
  },
  {
    icon: Building2,
    title: "SaaS Companies",
  },
  {
    icon: Briefcase,
    title: "Agencies",
  },
  {
    icon: Network,
    title: "n8n Users",
  },
  {
    icon: Database,
    title: "Zapier Users",
  },
  {
    icon: Cpu,
    title: "Make Users",
  },
  {
    icon: Users,
    title: "Operations Teams",
  },
];

export default function Audience() {
  return (
    <section className="py-32" id="audience">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">

          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-orange-400">

            Built For

          </span>

          <h2 className="mt-8 text-5xl font-bold">

            Teams that run
            <br />
            on automation.

          </h2>

          <p className="mt-6 text-gray-400">

            Whether you're shipping AI agents,
            automating operations,
            or running production workflows,
            FlowLens helps you debug faster.

          </p>

        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">

          {audience.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-[#161222] p-8 transition hover:-translate-y-2 hover:border-emerald-300/40"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/10">

                  <Icon className="text-emerald-300" size={28} />

                </div>

                <h3 className="mt-8 text-xl font-semibold">

                  {item.title}

                </h3>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}