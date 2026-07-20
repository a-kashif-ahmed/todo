"use client";

import {
  Bot,
  Workflow,
  Trash2,
  Database,
  Webhook,
  Link2,
  AlertTriangle,
} from "lucide-react";

const cases = [
  {
    icon: Workflow,
    title: "Workflow suddenly stopped",
    desc: "Yesterday everything worked. Today it doesn't.",
  },
  {
    icon: Bot,
    title: "Prompt update broke AI",
    desc: "A small prompt change caused unexpected responses.",
  },
  {
    icon: Trash2,
    title: "Deleted workflow node",
    desc: "Someone accidentally removed a critical step.",
  },
  {
    icon: Database,
    title: "CRM fields changed",
    desc: "Your mappings no longer match incoming data.",
  },
  {
    icon: Webhook,
    title: "Webhook payload changed",
    desc: "External APIs returned a different structure.",
  },
  {
    icon: Link2,
    title: "Multiple workflows failed",
    desc: "One small update broke your entire automation chain.",
  },
];

export default function UseCases() {
  return (
    <section className="py-32 bg-[#100D1C]" id="usecases">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">

          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-orange-400">
            Common Problems
          </span>

          <h2 className="mt-8 text-5xl font-bold">
            When FlowLens becomes
            <span className="text-emerald-300"> indispensable.</span>
          </h2>

          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            These are the issues automation teams face every week.
            FlowLens helps you solve them in minutes instead of hours.
          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {cases.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-[#161222] p-8 hover:border-emerald-300/40 hover:-translate-y-2 transition-all duration-300"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/10">

                  <Icon className="text-emerald-300"/>

                </div>

                <h3 className="mt-8 text-2xl font-semibold">

                  {item.title}

                </h3>

                <p className="mt-4 text-gray-400 leading-7">

                  {item.desc}

                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}