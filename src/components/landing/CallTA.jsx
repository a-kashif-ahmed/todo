"use client";

import { useState } from "react";

export default function CallTA() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function joinWaitlist() {

    if (!email) return;

    setLoading(true);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Thanks for joining waitlist! Stay Tuned.");
      setEmail("");
    } else {
      setMessage(data.error || "Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <section className="py-32" id="cta">

      <div className="max-w-6xl mx-auto px-6">

        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-emerald-300 to-lime-900 p-16">

          <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 text-center">

            <h2 className="mt-8 text-4xl font-bold">

              Stop guessing.
              <br />
              Start understanding.

            </h2>

            <p className="mx-auto mt-6 max-w-xl text-gray-200">

              Every minute spent debugging is a minute your automation isn't working.

              Join the FlowLens waitlist and be among the first to debug AI workflows.

            </p>

            <div className="mt-10 flex justify-center gap-4 flex-wrap">

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-80 rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-white placeholder:text-gray-300 outline-none focus:border-white"
              />

              <button
                onClick={joinWaitlist}
                disabled={loading}
                className="rounded-xl bg-white px-8 py-3 font-semibold text-black transition hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </button>

            </div>

            {message && (
              <p className="mt-6 text-lg font-medium">
                {message}
              </p>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}