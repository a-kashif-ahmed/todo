
import {
  BrainCircuit,
  Database,
  Mail,
  Workflow as WorkflowIcon,
  ArrowRight,
} from "lucide-react";

export default function Workflow() {
  return (
    <section className="py-32" id='workflow'>

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left */}

          <div>



            <h2 className="mt-8 text-5xl font-bold leading-tight">

              Build powerful workflows

              <span className="text-emerald-300">
                {" "}visually
              </span>

            </h2>

            <p className="mt-8 text-lg leading-8 text-gray-400">

              Connect AI, databases, APIs and your favorite tools
              using an intuitive visual editor.
              Deploy anywhere in seconds.

            </p>

            <div className="mt-10 space-y-6">

              <div className="flex gap-4">

                <BrainCircuit className="text-emerald-300 mt-1" />

                <div>

                  <h4 className="font-semibold text-xl">
                    AI Powered
                  </h4>

                  <p className="text-gray-400 mt-2">
                    GPT, Claude, Gemini and open-source models.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <WorkflowIcon className="text-emerald-300 mt-1" />

                <div>

                  <h4 className="font-semibold text-xl">

                    Drag & Drop

                  </h4>

                  <p className="text-gray-400 mt-2">

                    No coding required.
                    Design workflows visually.

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="relative">

            <div className="absolute inset-0 bg-emerald-300/10 blur-[120px]" />

            <div className="relative rounded-3xl border border-white/10 bg-[#161222] p-10">

              <div className="space-y-6">

                {/* Card */}

                <div className="flex items-center justify-between rounded-2xl bg-[#201a35] p-5">

                  <div className="flex items-center gap-4">

                    <BrainCircuit className="text-emerald-300" />

                    <span>AI Agent</span>

                  </div>

                  <ArrowRight />

                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#201a35] p-5">

                  <div className="flex items-center gap-4">

                    <Database className="text-green-400" />

                    <span>Database</span>

                  </div>

                  <ArrowRight />

                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#201a35] p-5">

                  <div className="flex items-center gap-4">

                    <Mail className="text-blue-400" />

                    <span>Email Notification</span>

                  </div>

                  <ArrowRight />

                </div>

                <a href="#cta"><button className="rounded-xl bg-gradient-to-br from-emerald-300 to-lime-700 px-8 py-4 font-semibold text-white transition hover:scale-105 ">

                  Start Free
                </button></a>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}