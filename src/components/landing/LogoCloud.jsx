const companies = [
  "Google",
  "Microsoft",
  "OpenAI",
  "AWS",
  "GitHub",
  "Stripe",
  "Vercel",
  "Cloudflare",
];

export default function LogoCloud() {
  return (
    <section className="py-28">

      <div className="max-w-7xl mx-auto px-6">

        <p className="text-center uppercase tracking-[6px] text-gray-500 text-sm mb-12">

          Trusted by modern teams

        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">

          {companies.map((company) => (

            <div
              key={company}
              className="rounded-2xl border border-white/5 bg-white/[0.03] py-6 text-center text-gray-400 transition duration-300 hover:border-emerald-300/40 hover:bg-emerald-300/10 hover:text-white"
            >
              <span className="font-semibold tracking-wide">

                {company}

              </span>
            </div>

          ))}

        </div>

      </div>

    </section>
  );
}