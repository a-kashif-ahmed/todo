"use client";

export default function Philosophy() {

  return (

    <section className="py-40" id="#philosophy">

      <div className="max-w-5xl mx-auto px-6 text-center">

        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-orange-400">

          Our Philosophy

        </span>

        <h2 className="mt-12 text-6xl md:text-7xl font-bold leading-tight">

          Automation should
          <br />

          <span className="text-emerald-300">

            save time.

          </span>

        </h2>

        <h2 className="mt-10 text-5xl md:text-6xl font-bold text-gray-300">

          Debugging shouldn't.

        </h2>

        <p className="mt-16 text-2xl text-gray-400 leading-10 max-w-3xl mx-auto">

          We're building the AI mechanic for workflows.

          <br /><br />

          When something breaks,

          <span className="text-white font-semibold">

            {" "}FlowLens tells you exactly why.

          </span>

        </p>

      </div>

    </section>

  );
}