import {
  Search,
  Rocket,
  BookOpen,
  Network,
  CreditCard,
  MessageSquare,
  Mail,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const topics = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "The core fundamentals of FlowLens automation.",
    action: "Explore",
  },
  {
    icon: BookOpen,
    title: "API Reference",
    description: "Detailed endpoint docs for custom integrations.",
    action: "Read Docs",
  },
  {
    icon: Network,
    title: "Integrations",
    description: "Connect to n8n, Zapier, Make, and more.",
    action: "View All",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Manage subscriptions and usage credits.",
    action: "Manage",
  },
];

const support = [
  {
    icon: MessageSquare,
    title: "Community Forum",
    description: "Active discussions on Discord",
    action: "Join Server",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Expected response: ~4 hours",
    action: "Open Ticket",
  },
  {
    icon: MessageSquare,
    title: "Priority Chat",
    description: "Live agent available now",
    action: "Start Chatting",
    badge: "PRO",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <div className="mx-auto max-w-7xl px-8 py-1">

        {/* Hero */}

        <div className="relative mb-14 overflow-hidden rounded-3xl border border-white/10 bg-surface2 p-12">

          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg- blur-[140px]" />

          <div className="relative z-10 text-center">

            <h1 className="text-5xl font-bold">
              How can we help?
            </h1>

            <p className="mt-4 text-primary max-w-2xl mx-auto">
              Search our documentation, community discussions, or let our AI
              detective guide you through complex automation debugging.
            </p>

            <div className="mt-10 flex overflow-hidden rounded-2xl border border-white/10 bg-surface2">
              <div className="flex flex-1 items-center gap-3 px-5">
                <Search size={20} className="text-primary-500" />

                <input
                  placeholder='Describe your issue (e.g. "Error in webhook sync")'
                  className="h-16 w-full bg-transparent outline-none placeholder:text-primary-500"
                />
              </div>

              <button className="m-2 rounded-xl bg-brand-orange500 px-8 font-medium hover:bg-brand-orange">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* AI */}

          <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br bg-brand-orange  p-8 lg:col-span-2">

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
              <Sparkles size={12} />
              AI Detective
            </div>

            <h2 className="mt-5 text-5xl font-bold">
              FlowLens AI
              <br />
              Assistant
            </h2>

            <p className="mt-5 max-w-md text-purple-100">
              Our AI detective has analyzed over two million workflow errors.
              Paste your logs or describe the behavior, and it will find the
              root cause in seconds.
            </p>

            <button className="mt-8 rounded-xl bg-inactive px-6 py-3 font-medium hover:bg-surface">
              Start AI Consultation
            </button>

            <div className="absolute right-8 top-1/2 h-60 w-60 -translate-y-1/2 rounded-3xl bg-" />
          </div>

          {/* Status */}

          <div className="rounded-3xl border border-white/10 bg-surface2 p-8">

            <h3 className="text-sm font-semibold tracking-widest text-primary-500">
              SYSTEM STATUS
            </h3>

            <div className="mt-8 space-y-6">

              <Status
                title="API Gateway"
                status="Operational"
                color="bg-brand-orange"
              />

              <Status
                title="Workflow Engine"
                status="Operational"
                color="bg-brand-orange"
              />

              <Status
                title="AI Training Cluster"
                status="Maintenance"
                color="bg-orange-400"
              />
            </div>

            <button className="mt-10 text-brand-orange hover:text-brand-orange300">
              Full Incident Report →
            </button>
          </div>
        </div>

        {/* Topics */}

        <section className="mt-16">

          <h2 className="mb-6 text-3xl font-bold">
            Common Topics
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {topics.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-brand-orange p-8 transition hover:border-brand-orange500/30"
                >
                  <Icon className="mb-8 text-brand-orange300" size={30} />

                  <h3 className="text-priary text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-muted">
                    {item.description}
                  </p>

                  <button className="mt-8 flex items-center gap-2 text-brand-orange">
                    {item.action}
                    <ExternalLink size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Help */}

        <section className="mt-16">

          <h2 className="mb-6 text-3xl font-bold">
            Still need help?
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {support.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-brand-orange p-8 hover:border-brand-orange500/30"
                >
                  <div className="flex items-center gap-3">

                    <div className="rounded-xl  p-3">
                      <Icon />
                    </div>

                    <div>

                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        {item.badge && (
                          <span className="rounded bg-brand-orange500 px-2 py-0.5 text-xs">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button className="mt-6 text-brand-brown">
                    {item.action}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

function Status({
  title,
  status,
  color,
}: {
  title: string;
  status: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span>{title}</span>

      <div className="flex items-center gap-2 text-sm text-primary">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {status}
      </div>
    </div>
  );
}