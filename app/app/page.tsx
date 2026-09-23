"use client";

import { useBoolVariation } from "@launchdarkly/react-sdk";

export default function Home() {
  const aiSolutionAdvisor = useBoolVariation("ai-solution-advisor", false);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-10 py-6">
        <div className="text-2xl font-bold">ABC Cloud</div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 rounded-full bg-green-400"></span>
          Production
        </div>
      </nav>

      <section className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-12 px-10 py-20 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Enterprise Software
          </p>

          <h1 className="mb-6 text-5xl font-bold leading-tight">
            Build better customer experiences, faster.
          </h1>

          <p className="mb-8 text-lg leading-8 text-slate-400">
            ABC Cloud helps enterprise teams modernize operations, serve
            customers, and deliver new experiences with confidence.
          </p>

          {aiSolutionAdvisor ? (
            <button className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white">
              Ask our AI Advisor
            </button>
          ) : (
            <button className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-950">
              Request a Demo
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-indigo-400">
              CURRENT EXPERIENCE
            </p>

            <span className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold">
              {aiSolutionAdvisor ? "ON" : "OFF"}
            </span>
          </div>

          {aiSolutionAdvisor ? (
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">
                New Experience
              </p>

              <h2 className="mb-3 text-2xl font-bold">
                AI Solution Advisor
              </h2>

              <p className="mb-6 text-slate-400">
                Tell us what your organization is trying to accomplish and our
                AI advisor will help identify the best ABC Cloud solution.
              </p>

              <div className="rounded-xl border border-indigo-500/40 bg-slate-950 p-5">
                <p className="mb-3 text-sm text-slate-400">
                  What can we help you solve?
                </p>

                <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-500">
                  Example: We want to automate customer order processing...
                </div>

                <button className="mt-4 w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white">
                  Get Recommendation
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
                Existing Experience
              </p>

              <h2 className="mb-3 text-2xl font-bold">
                Traditional Demo Request
              </h2>

              <p className="mb-6 text-slate-400">
                Visitors currently contact the ABC sales team through the
                standard demo request process.
              </p>

              <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">Feature</p>

                <div className="mt-2 flex items-center justify-between">
                  <span>AI Solution Advisor</span>

                  <span className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold">
                    OFF
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}