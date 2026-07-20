"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How is FlowLens different from logs?",
    answer:
      "Logs tell you where execution stopped. FlowLens explains why it failed, what changed, and how to fix it.",
  },
  {
    question: "Does FlowLens support n8n?",
    answer:
      "Yes. FlowLens is designed for n8n first and support for Zapier, Make and custom workflow engines is planned.",
  },
  {
    question: "Can FlowLens compare workflow versions?",
    answer:
      "Yes. Every version is analyzed so you can immediately see node, variable, prompt and connection changes.",
  },
  {
    question: "Does it replace monitoring tools?",
    answer:
      "No. Monitoring tells you something failed. FlowLens tells you why it failed.",
  },
  {
    question: "Is my workflow data secure?",
    answer:
      "Security comes first. Workflow analysis is designed with privacy, encryption and secure handling in mind.",
  },
];

export default function FAQ() {

  const [open, setOpen] = useState(0);

  return (

    <section className="py-32" id="faq">

      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center">

          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-orange-400">
            FAQ
          </span>

          <h2 className="mt-8 text-5xl font-bold">

            Frequently Asked Questions

          </h2>

        </div>

        <div className="mt-16 space-y-5">

          {faqs.map((faq, index) => (

            <div
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-[#161222]"
            >

              <button
                onClick={() => setOpen(open === index ? -1 : index)}
                className="w-full flex justify-between items-center p-6 text-left"
              >

                <span className="font-semibold text-lg">

                  {faq.question}

                </span>

                <ChevronDown
                  className={`transition ${
                    open === index ? "rotate-180" : ""
                  }`}
                />

              </button>

              {open === index && (

                <div className="px-6 pb-6 text-gray-400 leading-8">

                  {faq.answer}

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </section>

  );
}