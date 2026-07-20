import {
  Bot,
  Workflow,
  Database,
  Shield,
  Sparkles,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Root Cause Analysis",
    description:
      "FlowLens analyzes workflow changes and explains failures in plain English, so you spend less time investigating and more time building.",
  },
  {
    icon: Workflow,
    title: "Workflow Version Comparison",
    description:
      "Compare every version automatically and instantly identify changed nodes, prompts, variables, and connections.",
  },
  {
    icon: Database,
    title: "Impact Analysis",
    description:
      "Understand exactly which workflows, agents, APIs, or downstream systems are affected before customers notice.",
  },
  {
    icon: Shield,
    title: "One-Click Recovery",
    description:
      "Restore the last working version or apply AI-powered recommendations to recover quickly.",
  },
 
];

export default function Features() {
  return (
      
      
    <section className="py-32" id="features">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">


          <h2 className="mt-8 text-5xl font-bold">

            Everything you need to debug AI workflows faster

          </h2>

          

        </div>

        <div className="flex justify-center mt-20 pl-20 pr-20 grid gap-16 md:grid-cols-2 lg:grid-cols-2">

          {features.map((feature) => {

            const Icon = feature.icon;

            return (

              <div
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-[#161222] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300/40 hover:shadow-[0_0_40px_rgba(249,115,22,.15)]"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-300 transition group-hover:scale-110">

                  <Icon size={28} />

                </div>

                <h3 className="mt-8 text-2xl font-semibold">

                  {feature.title}

                </h3>

                <p className="mt-4 leading-8 text-gray-400">

                  {feature.description}

                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}