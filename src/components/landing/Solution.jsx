"use client";

import {
  CheckCircle2,
  Clock3,
  Users,
  Wrench,
  GitBranch,
  TriangleAlert,
  FileStack, Activity,
  WandSparkles,
  WandSparklesIcon
  
} from "lucide-react";

const items = [
  {
    icon: Clock3,
    title: "Understand What Changed",
    description: "Time-travel through every execution.Pinpoint the exact second your logic diverged from expectation",
  },
  {
    icon: Activity,
    title: "Find Root Cause",
    description: "No more 'Undefined' errors FlowLens trace depth goes into 3rd party APIs to find the true culprit",
  },
  {
    icon: FileStack,
    title: "Visual Worflow Comparsion",
    description: "Diff views that actually make sense. See changes in your workflow nodes and data flows side-by-side.",
  },
  {
    icon: WandSparklesIcon,
    title: "AI-powered recovery",
    description: "Get instant code fixes or logic adjustments. Recover failed runs with a single click of the AI assistant.",
  },
 
];

export default function Solution() {
  return (
    <section className="py-32" id="solution">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">

          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-green-400">
            The Solution
          </span>

          <h2 className="mt-8 text-5xl font-bold leading-tight">

            Today debugging looks like Logs, Backups, Trial and Error.
            <br />


          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-gray-400">

            Instead: FlowLens investigates automatically.

          </p>

        </div>

        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {items.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-[#161222] p-8 transition duration-300 hover:-translate-y-2 hover:border-emerald-300/40 hover:shadow-[0_0_40px_rgba(249,115,22,.15)]"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">

                  <Icon size={28} />

                </div>

                <h3 className="mt-8 text-2xl font-semibold">

                  {item.title}

                </h3>
                <p className="mt-8 text-2xl opacity-40"> {item.description}</p>

              </div>

            );

          })}

        </div>

        <div className="mt-20 rounded-3xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent p-10">

          <h3 className="text-3xl font-bold">

            No guessing.

          </h3>

          <h3 className="mt-3 text-3xl font-bold">

            No endless debugging.

          </h3>

          <h3 className="mt-3 text-4xl font-bold text-orange-400">

            Just answers.

          </h3>

        </div>

      </div>

    </section>
  );
}