"use client";

import { CheckCircle2, XCircle } from "lucide-react";

const rows = [
  ["Stack traces", "AI-powered root cause analysis"],
  ["Error logs", "Plain-English explanations"],
  ["Execution failures", "Workflow version history"],
  ["Raw JSON differences", "Impact analysis"],
  ["Manual investigation", "Guided recovery"],
];

export default function WhyFlowLens() {
  return (
    <section className="py-32" id="whyus">

      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center">

          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-orange-400">
            Why FlowLens
          </span>

          <h2 className="mt-8 text-5xl font-bold">

            Most debugging tools
            <br />
            tell you what failed.

          </h2>

          <h2 className="mt-4 text-5xl font-bold text-emerald-300">

            FlowLens tells you why.

          </h2>

        </div>

        <div className="mt-20 rounded-3xl border border-white/10 overflow-hidden">

          <div className="grid grid-cols-2 bg-[#1c1730] p-6 font-semibold">

            <div>Traditional Tools</div>

            <div>FlowLens</div>

          </div>

          {rows.map((row) => (

            <div
              key={row[0]}
              className="grid grid-cols-2 border-t border-white/10"
            >

              <div className="flex items-center gap-3 p-6 bg-[#161222]">

                <XCircle className="text-red-400" />

                {row[0]}

              </div>

              <div className="flex items-center gap-3 p-6 bg-[#1b162d]">

                <CheckCircle2 className="text-green-400" />

                {row[1]}

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}