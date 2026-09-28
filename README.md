# Moving Faster Without Increasing Customer Risk

## ABC Cloud — LaunchDarkly Solution Engineer Demo

ABC Cloud is a fictional B2B SaaS company introducing a new customer-facing **AI Solution Advisor**.

The goal of this demo is to show how LaunchDarkly can help a company move faster while maintaining control over customer impact.

Rather than demonstrating separate LaunchDarkly capabilities in isolation, the same feature is taken through its full lifecycle:

```text
Release
→ Target
→ Remediate
→ Measure
→ Control AI at Runtime
```

---

# The Customer Challenge

ABC Cloud has built an AI Solution Advisor that helps prospective customers identify the right solution based on their business problem.

The feature is ready to deploy, but ABC Cloud does not want deployment to automatically mean that every customer receives the new experience.

The business needs to answer five questions:

1. How do we release a new feature independently from deployment?
2. How do we control which customers receive it?
3. How do we recover quickly if the experience causes a problem?
4. How do we know whether the new experience actually improves a business outcome?
5. How do we change AI behavior without constantly changing and redeploying application code?

LaunchDarkly is used as the runtime control layer across each of those decisions.

---

# Demo Feature

The main feature flag is:

```text
ai-solution-advisor
```

The two experiences are:

```text
false → Traditional Demo Request

true  → AI Solution Advisor
```

The same flag is reused throughout release management, targeting, remediation, and experimentation.

---

# 1. Release Safely

## Customer question

How can ABC Cloud deploy the new experience without immediately exposing it to every customer?

## LaunchDarkly approach

The AI Solution Advisor is deployed in the application but controlled separately through LaunchDarkly.

When the flag is OFF, the customer sees the existing:

```text
Traditional Demo Request
```

When the flag is ON, the customer sees:

```text
AI Solution Advisor
```

Changing the flag in LaunchDarkly updates the running customer experience immediately.

No new deployment or page refresh is required.

## Demo

1. Open ABC Cloud with the AI Solution Advisor enabled.
2. Turn the feature OFF in LaunchDarkly.
3. Watch the application immediately return to the traditional experience.
4. Turn the feature back ON.
5. Watch the AI Solution Advisor return.

### Customer takeaway

**Deployment and release are separate decisions.**

---

# 2. Deliver the Right Experience to the Right Audience

## Customer question

If a capability is available in production, should every customer receive it at the same time?

## LaunchDarkly approach

ABC Cloud uses targeting to control who receives the AI Solution Advisor.

The demo uses three customer personas.

---

## Jordan Lee — Individual Targeting

```text
Company: Northstar Labs
Plan: Standard
```

Jordan is explicitly selected to receive the AI Solution Advisor.

This demonstrates **individual targeting**.

---

## James Carter — Rule-Based Targeting

```text
Company: Acme Industries
Plan: Enterprise
```

James receives the AI Solution Advisor because his organization matches the Enterprise targeting rule.

This demonstrates **rule-based targeting**.

---

## Maria Lopez — Default / Experiment Audience

```text
Company: BrightPath Logistics
Plan: Standard
```

Maria does not match the individual target or Enterprise rule.

She demonstrates the default targeting behavior and is also used as part of the experimentation story.

### Customer takeaway

**Release can be controlled by customer, account, plan, or other business attributes rather than being all-or-nothing.**

---

# 3. Recover Quickly When Something Goes Wrong

## Customer question

What happens if the new experience causes a production problem?

## LaunchDarkly approach

ABC Cloud includes a **Production Operations — Incident Simulator**.

When the AI Solution Advisor is active, clicking:

```text
Simulate Production Incident
```

initiates a remediation flow.

The application calls a private server-side endpoint:

```text
POST /api/remediate
```

That endpoint invokes a LaunchDarkly trigger that disables the feature.

The running browser receives the updated flag decision and immediately returns the user to the traditional experience.

### Demo flow

```text
Production issue detected
        ↓
Remediation triggered
        ↓
LaunchDarkly disables feature
        ↓
Customer exposure stops
        ↓
Traditional experience restored
```

### Customer takeaway

**ABC Cloud can remove customer exposure immediately without waiting for another deployment.**

---

# 4. Measure Business Impact

## Customer question

The AI experience may look better, but does it actually improve the business outcome ABC Cloud cares about?

## LaunchDarkly approach

ABC Cloud uses LaunchDarkly Experimentation to test the same:

```text
ai-solution-advisor
```

feature.

The experiment compares:

### Control

```text
Traditional Demo Request
```

### Treatment

```text
AI Solution Advisor
```

The experiment is randomized by user.

---

## Hypothesis

> If visitors receive the AI Solution Advisor experience, then more visitors will request a demo because the experience gives them a more personalized path to the right solution.

---

## Primary Business Metric

The primary metric is:

```text
Demo Request Conversion - AI Advisor
```

The underlying custom event is:

```text
demo-requested
```

The important design choice is that both experiences measure the same downstream business outcome.

Traditional experience:

```text
Request a Demo
        ↓
demo-requested
```

AI experience:

```text
Enter business problem
        ↓
Generate recommendation
        ↓
Request My Demo
        ↓
demo-requested
```

This avoids measuring whether someone merely interacted with the AI feature.

Instead, it measures whether the experience influenced the business outcome ABC Cloud cares about.

---

# Synthetic Experiment Traffic

The sample application does not receive real production traffic.

To demonstrate the experiment mechanics, the project includes a synthetic traffic simulator at:

```text
/traffic
```

The simulator creates demo visitors and conversion behavior.

## Real LaunchDarkly behavior

- Feature flag evaluation
- Variation assignment
- Experiment exposure
- `demo-requested` events
- Experiment metric processing

## Simulated behavior

- Visitor identities
- Conversion probability
- Customer behavior

Synthetic results are used only to demonstrate how the experiment is instrumented and measured.

They are **not intended to prove that the AI Solution Advisor would produce the same result in a real customer population**.

### Customer takeaway

**The team can evaluate business impact instead of assuming that a newly released feature is better.**

---

# 5. Control AI Behavior at Runtime

## Customer question

Feature flags control application behavior, but AI introduces another runtime concern:

How can ABC Cloud change prompts and models without constantly changing and redeploying application code?

## LaunchDarkly approach

The AI Solution Advisor is connected to **LaunchDarkly AgentControl**.

ABC Cloud retrieves the active AI configuration through:

```text
POST /api/agent-config
```

The running application retrieves and displays the current:

- AI model
- provider
- temperature
- token configuration
- agent prompt / instructions

The active configuration appears in the application under:

```text
LIVE AGENTCONTROL CONFIG
```

---

## Runtime Prompt Change

The prompt can be edited directly in LaunchDarkly.

For example, the prompt was updated to include:

```text
Begin every recommendation with the phrase:
"Executive recommendation:"
```

After the change was saved in LaunchDarkly, the running ABC Cloud application retrieved the new prompt without:

- changing application code
- restarting the application
- redeploying the application

---

## Runtime Model Change

The model was also changed through LaunchDarkly from:

```text
claude-haiku-4-5-20251001
```

to:

```text
claude-sonnet-4-6
```

The running ABC Cloud application retrieved the new model configuration without a redeployment.

### Customer takeaway

**The same runtime-control approach used for software releases can also be applied to AI configuration.**

---

# AI Provider Note

This demo does not include an external Anthropic API key.

The following AgentControl behavior is live:

- configuration evaluation
- prompt retrieval
- model retrieval
- provider retrieval
- model changes
- prompt changes

The final recommendation-card content itself is simulated.

This keeps the demonstration focused on LaunchDarkly's runtime AI configuration capabilities without requiring an external model-provider account.

---

# Application Routes

Main ABC Cloud application:

```text
/
```

Experiment traffic simulator:

```text
/traffic
```

Production remediation endpoint:

```text
POST /api/remediate
```

AgentControl configuration endpoint:

```text
POST /api/agent-config
```

---

# Technology

The application is built with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- LaunchDarkly React SDK
- LaunchDarkly Node Server SDK
- LaunchDarkly Server AI SDK / AgentControl

---

# Running the Project

## GitHub Codespaces

The project can be run entirely through GitHub Codespaces.

1. Open the repository.
2. Click **Code**.
3. Select **Codespaces**.
4. Create or open a Codespace.
5. Open the terminal.

Run:

```bash
cd app
npm install
npm run dev
```

Open forwarded port:

```text
3000
```

---

## Local Development

Requirements:

```text
Node.js 20+
npm
```

Clone the repository:

```bash
git clone https://github.com/eglisti01/Launchdarkly-se-demo.git

cd Launchdarkly-se-demo/app

npm install
```

Create:

```text
.env.local
```

inside the `app` directory.

Then run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Environment Variables

The application expects:

```env
NEXT_PUBLIC_LD_CLIENT_SIDE_ID=
LAUNCHDARKLY_TRIGGER_URL=
LAUNCHDARKLY_SDK_KEY=
LAUNCHDARKLY_AI_CONFIG_KEY=
```

## NEXT_PUBLIC_LD_CLIENT_SIDE_ID

Used for browser-based feature flag evaluation and targeting.

## LAUNCHDARKLY_TRIGGER_URL

Private trigger URL used for the remediation demonstration.

## LAUNCHDARKLY_SDK_KEY

Private server-side LaunchDarkly SDK key.

## LAUNCHDARKLY_AI_CONFIG_KEY

AgentControl configuration key used by the AI Solution Advisor.

Private values are intentionally excluded from source control.

---

# Project Structure

```text
Launchdarkly-se-demo
│
├── app
│   ├── app
│   │   ├── api
│   │   │   ├── agent-config
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   └── remediate
│   │   │       └── route.ts
│   │   │
│   │   ├── traffic
│   │   │   └── page.tsx
│   │   │
│   │   ├── ld-provider.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   └── package.json
│
└── README.md
```

---

# Demo Flow

The live demonstration follows one customer story.

## 1. Release

Turn the AI Solution Advisor ON and OFF through LaunchDarkly.

Show that the customer experience changes immediately without a deployment.

## 2. Target

Switch between:

```text
Jordan Lee
James Carter
Maria Lopez
```

Show individual targeting, rule-based targeting, and default behavior.

## 3. Remediate

Select a customer receiving the AI Solution Advisor.

Click:

```text
Simulate Production Incident
```

Show the experience immediately returning to the known-good version.

## 4. Measure

Show the experiment using:

```text
ai-solution-advisor
```

and:

```text
demo-requested
```

Show experiment exposures and the conversion metric.

## 5. Control AI Runtime

Generate an AI Solution Advisor recommendation.

Show:

```text
LIVE AGENTCONTROL CONFIG
```

Change the prompt or model inside LaunchDarkly.

Return to ABC Cloud and refresh the AI configuration.

Show that the running application receives the new model or prompt without a redeployment.

---

# Solution Summary

The same feature moves through its entire lifecycle:

```text
Deploy
   ↓
Release
   ↓
Target
   ↓
Remediate
   ↓
Measure
   ↓
Control AI Runtime
```

The core principle behind the demo is:

> Deployment determines what code exists in production. LaunchDarkly provides control over who experiences it, when they experience it, how safely exposure can change, how business impact is measured, and how runtime behavior can evolve.

---

# Security

This repository does not intentionally contain:

- LaunchDarkly server SDK keys
- LaunchDarkly trigger URLs
- external AI provider API keys

Private values are stored in `.env.local`, which is excluded from source control.

This project is an interview demonstration application and is not intended to represent a complete production architecture.