"use client";

import { useState } from "react";
import {
  useBoolVariation,
  useLDClient,
} from "@launchdarkly/react-sdk";

const personas = {
  jordan: {
    label: "Jordan Lee",
    company: "Northstar Labs",
    plan: "Standard",
    expectedReason: "Individual target",
    context: {
      kind: "multi",
      user: {
        key: "jordan-lee",
        name: "Jordan Lee",
        role: "Product Manager",
        betaTester: true,
      },
      organization: {
        key: "northstar-labs",
        name: "Northstar Labs",
        plan: "standard",
        region: "US",
      },
      device: {
        key: "jordan-desktop",
        type: "desktop",
        browser: "Chrome",
      },
    },
  },

  james: {
    label: "James Carter",
    company: "Acme Industries",
    plan: "Enterprise",
    expectedReason: "Enterprise plan rule",
    context: {
      kind: "multi",
      user: {
        key: "james-carter",
        name: "James Carter",
        role: "Procurement Manager",
        betaTester: false,
      },
      organization: {
        key: "acme-industries",
        name: "Acme Industries",
        plan: "enterprise",
        region: "US",
      },
      device: {
        key: "james-desktop",
        type: "desktop",
        browser: "Chrome",
      },
    },
  },

  maria: {
    label: "Maria Lopez",
    company: "BrightPath Logistics",
    plan: "Standard",
    expectedReason: "No matching target or rule",
    context: {
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
    },
  },
};

type PersonaKey = keyof typeof personas;

export default function Home() {
  const aiSolutionAdvisor = useBoolVariation(
    "ai-solution-advisor",
    false
  );

  const ldClient = useLDClient();

  // Maria is our starting persona because ld-provider.tsx
  // is currently initialized with Maria's context.
  const [currentPersonaKey, setCurrentPersonaKey] =
    useState<PersonaKey>("maria");

  const [isSwitching, setIsSwitching] = useState(false);

  const currentPersona = personas[currentPersonaKey];

  async function switchPersona(personaKey: PersonaKey) {
    if (!ldClient) {
      return;
    }

    setIsSwitching(true);

    // Tell LaunchDarkly that a different person,
    // organization, and device are now using the app.
    await ldClient.identify(personas[personaKey].context);

    setCurrentPersonaKey(personaKey);
    setIsSwitching(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-slate-800 px-10 py-6">
        <div className="text-2xl font-bold">ABC Cloud</div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 rounded-full bg-green-400"></span>
          Production
        </div>
      </nav>

      <div className="border-b border-slate-800 bg-slate-900 px-10 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Demo Persona
            </p>

            <p className="mt-1 font-semibold">
              Viewing as: {currentPersona.label}
            </p>

            <p className="text-sm text-slate-400">
              {currentPersona.company} · {currentPersona.plan}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(personas) as PersonaKey[]).map((key) => (
              <button
                key={key}
                onClick={() => switchPersona(key)}
                disabled={isSwitching}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  currentPersonaKey === key
                    ? "border-indigo-400 bg-indigo-500 text-white"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                }`}
              >
                {personas[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-12 px-10 py-16 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Enterprise Software
          </p>

          <h1 className="mb-6 text-5xl font-bold leading-tight">
            Build better customer experiences, faster.
          </h1>

          <p className="mb-8 text-lg leading-8 text-slate-400">
            ABC Cloud helps enterprise teams modernize operations,
            serve customers, and deliver new experiences with
            confidence.
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

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              LaunchDarkly Context
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">User</span>
                <span>{currentPersona.label}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Organization
                </span>
                <span>{currentPersona.company}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Plan</span>
                <span>{currentPersona.plan}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Demo targeting path
                </span>
                <span>{currentPersona.expectedReason}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-indigo-400">
              CURRENT EXPERIENCE
            </p>

            <span className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold">
              {isSwitching
                ? "EVALUATING..."
                : aiSolutionAdvisor
                  ? "ON"
                  : "OFF"}
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
                Tell us what your organization is trying to
                accomplish and our AI advisor will help identify
                the best ABC Cloud solution.
              </p>

              <div className="rounded-xl border border-indigo-500/40 bg-slate-950 p-5">
                <p className="mb-3 text-sm text-slate-400">
                  What can we help you solve?
                </p>

                <div className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-500">
                  Example: We want to automate customer order
                  processing...
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
                Visitors currently contact the ABC sales team
                through the standard demo request process.
              </p>

              <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">
                <p className="text-sm text-slate-500">
                  AI Solution Advisor
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <span>Feature decision</span>

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