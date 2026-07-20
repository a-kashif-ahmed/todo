import { Zap } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative" id="top">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-24 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/10 blur-[150px]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* Left Column — Text */}
          <div className="flex flex-col items-start text-left">

            {/* Badge */}
            <span className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-green-400">
              <Zap size={16} />
              <span>New : AI ROOT CAUSE ANALYSIS</span>
            </span>

            {/* Heading */}
            <h1 className="mt-6 text-3xl font-extrabold leading-tight md:text-6xl">
              Your automation worked yesterday. Today it doesn't.
              <br />
              <span className="text-emerald-300">
                FlowLens tells you exactly why.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
              Stop reading logs and comparing JSON files. FlowLens visualizes exactly
              where your data branched off, what changed in your environment, and how to
              recover in minutes.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-5">
              <a href="#cta">
                <button className="rounded-xl bg-gradient-to-br from-emerald-300 to-lime-700 px-8 py-4 font-semibold text-white transition hover:scale-105">
                  Start Free
                </button>
              </a>
              <a href="#workflow">
                <button className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold backdrop-blur transition hover:bg-white/10">
                  How it works
                </button>
              </a>
            </div>
          </div>

          {/* Right Column — Visual */}
          <div className="flex items-center justify-center">
            <div className="w-full rounded-2xl border border-white/5 bg-[#111111]/80 p-4 shadow-2xl shadow-emerald-500/5 backdrop-blur-sm transition hover:border-white/10">
              <Image
                src="/hero_visual.png"
                alt="FlowLens Dashboard"
                width={700}
                height={500}
                className="w-full rounded-xl object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}