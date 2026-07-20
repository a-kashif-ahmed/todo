"use client";

import { CheckCircle2, XCircle } from "lucide-react";

const before = [
  "Reading logs",
  "Comparing JSON files",
  "Manual debugging",
  "Guessing root causes",
  "Hours of investigation",
];

const after = [
  "Know exactly what changed",
  "Understand why it failed",
  "See which systems are affected",
  "Recover with confidence",
  "Fix workflows in minutes",
];

export default function BeforeAfter() {
  return (
    <section className="py-32" id="bfaf">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">

          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-orange-400">
            Without vs With Flowlens
          </span>

          <h2 className="mt-8 text-5xl font-bold">
            Stop wasting hours
            <br />
            finding one tiny mistake.
          </h2>

          <p className="mt-6 text-gray-400">
            See the difference FlowLens makes.
          </p>

        </div>

        <div className="mt-20 grid lg:grid-cols-2 gap-8">

          {/* Before */}

          <div className="rounded-3xl border border-red-500/20 bg-[#161222] p-10">

            <h3 className="text-3xl font-bold text-red-400">
              Without FlowLens
            </h3>

            <div className="mt-10 space-y-6">

              {before.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 text-lg"
                >
                  <XCircle className="text-red-400" />
                  {item}
                </div>
              ))}

            </div>

          </div>

          {/* After */}

          <div className="rounded-3xl border border-green-500/20 bg-[#161222] p-10">

            <h3 className="text-3xl font-bold text-green-400">
              With FlowLens
            </h3>

            <div className="mt-10 space-y-6">

              {after.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 text-lg"
                >
                  <CheckCircle2 className="text-green-400" />
                  {item}
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}