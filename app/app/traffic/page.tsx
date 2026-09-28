"use client";

import { useState } from "react";

type SimulationResult = {
  success: boolean;
  batchId: number;
  visitorCount: number;
  control: {
    visitors: number;
    conversions: number;
    observedConversionRate: string;
  };
  treatment: {
    visitors: number;
    conversions: number;
    observedConversionRate: string;
  };
  note: string;
};

export default function TrafficSimulator() {
  const [visitorCount, setVisitorCount] = useState(300);
  const [controlRate, setControlRate] = useState(8);
  const [treatmentRate, setTreatmentRate] = useState(20);

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function runSimulation() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setResult(null);
    setErrorMessage("");

    try {
      const response = await fetch("/api/simulate-traffic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorCount,
          controlRate,
          treatmentRate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.details ||
            data.error ||
            "Synthetic traffic simulation failed."
        );
      }

      setResult(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Synthetic traffic simulation failed."
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-10 py-6">
        <div>
          <div className="text-2xl font-bold">ABC Cloud</div>

          <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">
            Internal Experiment Lab
          </div>
        </div>

        <a
          href="/"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          ← Return to ABC Cloud
        </a>
      </nav>

      <section className="mx-auto max-w-6xl px-8 py-12">
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Synthetic Demo Traffic
          </p>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
            This tool creates synthetic visitors for demonstration
            purposes. LaunchDarkly performs the real feature flag
            evaluations, experiment assignments, exposure events,
            and metric-event collection. Visitor identities and
            conversion behavior are simulated.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              Experiment Traffic Simulator
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Generate experiment traffic
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Create unique synthetic visitors and send them through
              the real LaunchDarkly experiment using the server-side
              SDK.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-semibold">
                  Number of visitors
                </label>

                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={visitorCount}
                  disabled={isRunning}
                  onChange={(event) =>
                    setVisitorCount(Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Recommended demo run: 300 visitors
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Control conversion probability
                </label>

                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={controlRate}
                    disabled={isRunning}
                    onChange={(event) =>
                      setControlRate(Number(event.target.value))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                  />

                  <span className="text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  AI Advisor conversion probability
                </label>

                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={treatmentRate}
                    disabled={isRunning}
                    onChange={(event) =>
                      setTreatmentRate(Number(event.target.value))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                  />

                  <span className="text-slate-400">%</span>
                </div>
              </div>
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="mt-8 w-full rounded-lg bg-indigo-500 px-5 py-4 font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isRunning
                ? "Generating Synthetic Traffic..."
                : "Generate Synthetic Traffic"}
            </button>

            {errorMessage && (
              <div className="mt-5 rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            {!result && !errorMessage && (
              <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
                Ready to generate synthetic experiment traffic.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Simulation Status
              </p>

              {!result ? (
                <div className="mt-5">
                  <p className="text-3xl font-bold">
                    {isRunning ? "Running..." : "Ready"}
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Results will appear here after the server-side
                    simulation completes.
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-3xl font-bold text-green-300">
                    {result.visitorCount} visitors processed
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Batch ID: {result.batchId}
                  </p>

                  <div className="mt-5 rounded-lg border border-green-500/20 bg-green-950/20 p-4">
                    <p className="text-sm font-semibold text-green-300">
                      ✓ LaunchDarkly events sent successfully
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      LaunchDarkly may take additional time to process
                      experiment results in the dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    Traditional Experience
                  </p>

                  <span className="rounded-md bg-slate-800 px-3 py-1 text-xs font-bold">
                    CONTROL
                  </span>
                </div>

                <div className="mt-7 text-4xl font-bold">
                  {result?.control.visitors ?? 0}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  visitors assigned
                </p>

                <div className="mt-6 border-t border-slate-800 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Demo requests
                    </span>

                    <span className="font-semibold">
                      {result?.control.conversions ?? 0}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-400">
                      Observed conversion
                    </span>

                    <span className="font-semibold">
                      {result?.control.observedConversionRate ?? "0%"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    AI Solution Advisor
                  </p>

                  <span className="rounded-md bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                    TREATMENT
                  </span>
                </div>

                <div className="mt-7 text-4xl font-bold text-indigo-300">
                  {result?.treatment.visitors ?? 0}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  visitors assigned
                </p>

                <div className="mt-6 border-t border-indigo-500/20 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Demo requests
                    </span>

                    <span className="font-semibold">
                      {result?.treatment.conversions ?? 0}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-400">
                      Observed conversion
                    </span>

                    <span className="font-semibold text-indigo-300">
                      {result?.treatment.observedConversionRate ?? "0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                What is real vs simulated?
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-green-400">✓</span>
                  <span>
                    LaunchDarkly feature flag evaluation and
                    variation assignment
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-400">✓</span>
                  <span>Experiment exposure events</span>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-400">✓</span>
                  <span>demo-requested metric events</span>
                </div>

                <div className="flex gap-3">
                  <span className="text-amber-400">●</span>
                  <span>
                    Visitor identities and conversion behavior are
                    synthetic
                  </span>
                </div>
              </div>

              {result && (
                <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4">
                  <p className="text-xs leading-5 text-slate-400">
                    {result.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}