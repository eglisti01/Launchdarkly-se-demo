"use client";

import { createLDReactProvider } from "@launchdarkly/react-sdk";

const clientSideId = process.env.NEXT_PUBLIC_LD_CLIENT_SIDE_ID;

if (!clientSideId) {
  throw new Error("Missing NEXT_PUBLIC_LD_CLIENT_SIDE_ID");
}

export const LDProvider = createLDReactProvider(clientSideId, {
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