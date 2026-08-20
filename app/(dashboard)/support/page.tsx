"use client";

import { useState } from "react";
import Link from "next/link";
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
  Loader2,
} from "lucide-react";

// "Getting Started" and "Integrations" link to real pages already in the
// app. "API Reference" and "Billing" have no backing page/content yet —
// rather than pretend those buttons do something, they're marked
// "Coming soon" and disabled, so nothing here silently does nothing.
const topics = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "The core fundamentals of FlowLens automation.",
    action: "Import a workflow",
    href: "/import",
  },
  {
    icon: BookOpen,
    title: "API Reference",
    description: "Detailed endpoint docs for custom integrations.",
    action: "Coming soon",
    href: null,
  },
  {
    icon: Network,
    title: "Integrations",
    description: "Connect to n8n, Zapier, Make, and more.",
    action: "View connections",
    href: "/connections",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Manage subscriptions and usage credits.",
    action: "Coming soon",
    href: null,
  },
];
const EMAIL = "flowlensaas@gmail.com"; 
const SUBJECT = "Issue - FlowLens";
const BODY = `Hi FlowLens Team,`;
const support = [
  {
    icon: MessageSquare,
    title: "Community Forum",
    href:'https://discord.gg/f2B6hamNMX',
    description: "Active discussions on Discord",
    action: "Join Server",
  },
  {
    icon: Mail,
    title: "Email Support",
    href:`mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`  ,
    description: "Expected response: ~4 hours",
    action: "Email Us",
  },
  // {
  //   icon: MessageSquare,
  //   title: "Priority Chat",
  //   description: "Live agent available now",
  //   action: "Start Chatting",
  //   badge: "PRO",
  // },
];

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    answer: string;
    matches: { id: string; name: string }[];
  } | null>(null);
  const [searchError, setSearchError] = useState("");

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      setSearchResult(data);
    } catch (e: unknown) {
      setSearchError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

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
              Search your workflows, or reach out to the team below.
            </p>

            <div className="mt-10 flex overflow-hidden rounded-2xl border-text border bg-surface2">
              <div className="flex flex-1 items-center gap-3 px-5">
                <Search size={20} className="text-primary-500" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                  placeholder='Ask about your workflows (e.g. "where is Stripe used")'
                  className="h-16 w-full bg-transparent outline-none placeholder:text-primary-500"
                />
              </div>

              <button
                onClick={runSearch}
                disabled={searching || !query.trim()}
                className="m-2 rounded-xl bg-brand-orange px-8 font-medium hover:bg-brand-orange text-white disabled:opacity-40 flex items-center gap-2"
              >
                {searching && <Loader2 size={16} className="animate-spin" />}
                Search
              </button>
            </div>

            {searchError && (
              <p className="mt-4 text-sm text-status-error">{searchError}</p>
            )}

            {searchResult && (
              <div className="mt-6 text-left bg-surface border border-border rounded-2xl p-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-brand-orange" />
                  <span className="text-sm font-medium text-text-primary">Answer</span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{searchResult.answer}</p>
                {searchResult.matches?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {searchResult.matches.map((m) => (
                      <Link
                        key={m.id}
                        href={`/workflows/${m.id}`}
                        className="text-xs font-medium bg-surface-2 border border-border rounded-full px-3 py-1.5 text-text-primary hover:border-brand-orange/40 transition-colors"
                      >
                        {m.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cards */}

       
        {/* Topics */}

        <section className="mt-16">

          <h2 className="mb-6 text-3xl font-bold">
            Common Topics
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {topics.map((item) => {
              const Icon = item.icon;
              const card = (
                <>
                  <Icon className="mb-8 text-white" size={30} />

                  <h3 className="text-white text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-white">
                    {item.description}
                  </p>

                  <span className="mt-8 flex items-center gap-2 text-brand-orange">
                    {item.action}
                    {item.href && <ExternalLink size={14} />}
                  </span>
                </>
              );

              if (!item.href) {
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-brand-orange p-8 opacity-60 cursor-not-allowed"
                  >
                    {card}
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-3xl border border-white/10 bg-brand-orange p-8 transition hover:border-brand-orange500/30 block"
                >
                  {card}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Help */}

        <section className="mt-16">

          <h2 className="mb-6 text-3xl font-bold">
            Still need help?
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {support.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-brand-orange p-8 hover:border-brand-orange500/30"
                >
                  <div className="flex items-center gap-3">

                    <div className="rounded-xl  p-3 text-white">
                      <Icon />
                    </div>

                    <div>

                      <div className="flex items-center gap-2 text-white">
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        
                      </div>

                      <p className="text-sm text-gray-50">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <a href={item.href}><button className="mt-8 text-white border border-white  rounded-xl bg- px-6 py-3 font-medium hover:opacity-90">
                    {item.action}
                  </button></a>
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
      <span className="p-5"></span>
      <div className="flex items-center gap-2 text-sm text-primary">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {status}
      </div>
    </div>
  );
}