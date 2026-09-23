"use client";

import { createLDReactProvider } from "@launchdarkly/react-sdk";

const clientSideId = process.env.NEXT_PUBLIC_LD_CLIENT_SIDE_ID;

if (!clientSideId) {
  throw new Error("Missing NEXT_PUBLIC_LD_CLIENT_SIDE_ID");
}

export const LDProvider = createLDReactProvider(clientSideId, {
  kind: "user",
  key: "demo-user",
  name: "Demo User",
});