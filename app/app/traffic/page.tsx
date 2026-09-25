"use client";

import { useState } from "react";
import { useLDClient } from "@launchdarkly/react-sdk";

export default function TrafficSimulator() {
  const ldClient = useLDClient();

  const [visitorCount, setVisitorCount] = useState(300);
  const [controlRate, setControlRate] = useState(8);
  const [treatmentRate, setTreatmentRate] = useState(20);

  const [isRunning, setIsRunning] = useState(false);
  const [processed, setProcessed] = useState(0);

  const [controlVisitors, setControlVisitors] = useState(0);
  const [treatmentVisitors, setTreatmentVisitors] = useState(0);
  const [controlConversions, setControlConversions] = useState(0);
  const [treatmentConversions, setTreatmentConversions] = useState(0);

  const [statusMessage, setStatusMessage] = useState(
    "Ready to generate synthetic experiment traffic."
  );

  async function runSimulation() {
    if (!ldClient || isRunning) {
      return;
    }

    setIsRunning(true);
    setProcessed(0);
    setControlVisitors(0);
    setTreatmentVisitors(0);
    setControlConversions(0);
    setTreatmentConversions(0);

    setStatusMessage(
      "Generating synthetic visitors and sending real LaunchDarkly evaluations..."
    );

    let localControlVisitors = 0;
    let localTreatmentVisitors = 0;
    let localControlConversions = 0;
    let localTreatmentConversions = 0;

    try {
      for (let i = 1; i <= visitorCount; i++) {
        const visitorKey = `synthetic-demo-user-${Date.now()}-${i}`;

        const context = {
          kind: "multi" as const,

          user: {
            key: visitorKey,
            name: `Synthetic Visitor ${i}`,
            role: "Demo Visitor",
            syntheticTraffic: true,
          },

          organization: {
            key: `synthetic-org-${i}`,
            name: `Synthetic Company ${i}`,
            plan: "standard",
            region: "US",
            syntheticTraffic: true,
          },

          device: {
            key: `synthetic-device-${i}`,
            type: "desktop",
            browser: "Chrome",
            syntheticTraffic: true,
          },
        };

        // Change LaunchDarkly to a brand-new synthetic visitor.
        await ldClient.identify(context);

        // This real flag evaluation creates the experiment exposure.
        const servedVariation = await ldClient.variation(
          "ai-solution-advisor",
          false
        );

        const receivedAIAdvisor = Boolean(servedVariation);

        if (receivedAIAdvisor) {
          localTreatmentVisitors += 1;

          const converted =
            Math.random() < treatmentRate / 100;

          if (converted) {
            localTreatmentConversions += 1;

            ldClient.track("demo-requested", {
              source: "synthetic-demo-traffic",
              experience: "ai-advisor",
              synthetic: true,
            });
          }
        } else {
          localControlVisitors += 1;

          const converted =
            Math.random() < controlRate / 100;

          if (converted) {
            localControlConversions += 1;

            ldClient.track("demo-requested", {
              source: "synthetic-demo-traffic",
              experience: "traditional",
              synthetic: true,
            });
          }
        }

        setProcessed(i);
        setControlVisitors(localControlVisitors);
        setTreatmentVisitors(localTreatmentVisitors);
        setControlConversions(localControlConversions);
        setTreatmentConversions(localTreatmentConversions);
      }

      // Push any remaining queued events to LaunchDarkly.
      await ldClient.flush();

      setStatusMessage(
        "Simulation complete. LaunchDarkly is processing the exposure and conversion events."
      );
    } catch (error) {
      console.error(error);

      setStatusMessage(
        "The simulation stopped because an error occurred. Check the browser console for details."
      );
    } finally {
      // Restore the normal demo persona so returning to ABC Cloud
      // starts from a familiar state.
      await ldClient.identify({
        kind: "multi",

        user: {
          key: "maria-lopez",
          name: "Maria Lopez",
          role: "Operations Manager",
          betaTester: false,
        },

        organization: {
          key: "brightpath-logistics",
          name: "BrightPath Logistics",
          plan: "standard",
          region: "US",
        },

        device: {
          key: "maria-desktop",
          type: "desktop",
          browser: "Chrome",
        },
      });

      setIsRunning(false);
    }
  }

  const progress =
    visitorCount > 0
      ? Math.round((processed / visitorCount) * 100)
      : 0;

  const controlObservedRate =
    controlVisitors > 0
      ? ((controlConversions / controlVisitors) * 100).toFixed(1)
      : "0.0";

  const treatmentObservedRate =
    treatmentVisitors > 0
      ? (
          (treatmentConversions / treatmentVisitors) *
          100
        ).toFixed(1)
      : "0.0";

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
            This tool creates simulated visitors for demonstration
            purposes. LaunchDarkly performs the actual feature flag
            evaluations, experiment assignments, exposures, and event
            collection. Only the visitor behavior and conversion
            probabilities are simulated.
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
              Create unique synthetic visitors and allow LaunchDarkly
              to assign each visitor to the control or AI Advisor
              experience.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-semibold">
                  Number of visitors
                </label>

                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={visitorCount}
                  disabled={isRunning}
                  onChange={(event) =>
                    setVisitorCount(
                      Number(event.target.value)
                    )
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
                      setControlRate(
                        Number(event.target.value)
                      )
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
                      setTreatmentRate(
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
                  />

                  <span className="text-slate-400">%</span>
                </div>
              </div>
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning || !ldClient}
              className="mt-8 w-full rounded-lg bg-indigo-500 px-5 py-4 font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isRunning
                ? `Generating Traffic... ${progress}%`
                : "Generate Synthetic Traffic"}
            </button>

            <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              {statusMessage}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Simulation Progress
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {processed} / {visitorCount}
                  </p>
                </div>

                <div className="text-4xl font-bold text-indigo-400">
                  {progress}%
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
                  {controlVisitors}
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
                      {controlConversions}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-400">
                      Observed conversion
                    </span>

                    <span className="font-semibold">
                      {controlObservedRate}%
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
                  {treatmentVisitors}
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
                      {treatmentConversions}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-400">
                      Observed conversion
                    </span>

                    <span className="font-semibold text-indigo-300">
                      {treatmentObservedRate}%
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
                    LaunchDarkly flag evaluation and variation
                    assignment
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-400">✓</span>
                  <span>
                    Experiment exposure events
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-400">✓</span>
                  <span>
                    demo-requested metric events
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-amber-400">●</span>
                  <span>
                    Visitor identities and conversion behavior are
                    synthetic
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}