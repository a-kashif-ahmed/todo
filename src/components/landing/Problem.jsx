"use client";

import { AlertTriangle, FileText, Search, GitCompare, Bot } from "lucide-react";

export default function Problem() {
  return (
    <section className="py-32" id="problem">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}

        <div>
        
          <h2 className="mt-8 text-5xl font-bold leading-tight">
            Debugging workflows
            <br />
            shouldn't feel like
            <br />
            <span className="text-emerald-300">detective work.</span>
          </h2>

          <div className="mt-10 space-y-5 text-lg text-gray-300">

            <p>Your automation suddenly stops working.</p>

            <p>Customers stop receiving emails.</p>

            <p>Orders stop syncing.</p>

            <p>Your AI agent starts returning errors.</p>

          </div>

          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">

            <p className="text-red-300 font-semibold text-xl">
               Execution Failed
            </p>

          </div>

          <div className="mt-10 space-y-5">

            <div className="flex gap-4">
              <FileText className="text-emerald-300 mt-1" />
              <span>Read hundreds of log lines</span>
            </div>

            <div className="flex gap-4">
              <GitCompare className="text-emerald-300 mt-1" />
              <span>Compare workflow JSON files</span>
            </div>

            <div className="flex gap-4">
              <Bot className="text-emerald-300 mt-1" />
              <span>Ask ChatGPT what changed</span>
            </div>

            <div className="flex gap-4">
              <Search className="text-emerald-300 mt-1" />
              <span>Test random fixes until something works</span>
            </div>

          </div>

          <p className="mt-10 text-2xl font-semibold">
            Hours later...
          </p>

          <p className="mt-4 text-xl text-gray-400">
            You discover someone renamed
            <span className="text-orange-400"> one field yesterday.</span>
          </p>

          <p className="mt-8 text-3xl font-bold">
            There has to be a better way.
          </p>

        </div>

        {/* Right */}

        <div className="relative">

          <div className="absolute inset-0 bg-red-500/10 blur-[100px]" />

          <div className="relative rounded-3xl border border-white/10 bg-[#161222] p-8">

            <div className="border-b border-white/10 pb-5">

              <h3 className="text-xl font-semibold">
                Workflow Execution
              </h3>

            </div>

            <div className="mt-6 rounded-xl bg-[#1f1832] p-5">

              <p className="text-red-400 font-semibold">
                Execution Failed
              </p>

              <p className="mt-2 text-gray-400 text-sm">
                Node: Send Email
              </p>

              <p className="text-gray-400 text-sm">
                Error: Invalid field
              </p>

            </div>

            <div className="mt-6 space-y-3 font-mono text-sm text-gray-500">

              <p>[INFO] Executing workflow...</p>
              <p>[INFO] Loading credentials...</p>
              <p>[INFO] Connecting...</p>
              <p>[WARN] Node failed...</p>
              <p>[ERROR] Invalid payload...</p>
              <p>[INFO] Retrying...</p>
              <p>[ERROR] Execution Failed</p>
              <p>[STACK TRACE] ...</p>
              <p>[STACK TRACE] ...</p>
              <p>[STACK TRACE] ...</p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}