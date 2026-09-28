import { init, type LDContext } from "@launchdarkly/node-server-sdk";

const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;

const ldClient = sdkKey ? init(sdkKey) : null;

export async function POST(request: Request) {
  if (!ldClient) {
    return Response.json(
      {
        success: false,
        error: "Missing LAUNCHDARKLY_SDK_KEY.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const visitorCount = Number(body.visitorCount ?? 20);
    const controlRate = Number(body.controlRate ?? 8);
    const treatmentRate = Number(body.treatmentRate ?? 20);

    // Basic validation so we don't accidentally create a huge traffic run.
    if (
      visitorCount < 1 ||
      visitorCount > 1000 ||
      controlRate < 0 ||
      controlRate > 100 ||
      treatmentRate < 0 ||
      treatmentRate > 100
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid simulator settings.",
        },
        { status: 400 }
      );
    }

    await ldClient.waitForInitialization({
      timeout: 10,
    });

    const batchId = Date.now();

    let controlVisitors = 0;
    let treatmentVisitors = 0;

    let controlConversions = 0;
    let treatmentConversions = 0;

    for (let i = 1; i <= visitorCount; i++) {
      const context: LDContext = {
        kind: "user",
        key: `server-synthetic-${batchId}-${i}`,
        name: `Synthetic Visitor ${i}`,

        // Makes it obvious in LaunchDarkly that this is demo traffic.
        syntheticTraffic: true,
        simulationBatch: String(batchId),
      };

      /*
       * This is a REAL LaunchDarkly feature flag evaluation.
       *
       * Because ai-solution-advisor is connected to the experiment,
       * this evaluation can create the experiment exposure event.
       */
      const receivedAIAdvisor = await ldClient.variation(
        "ai-solution-advisor",
        context,
        false
      );

      if (receivedAIAdvisor) {
        // Treatment = AI Solution Advisor
        treatmentVisitors++;

        const converted = Math.random() < treatmentRate / 100;

        if (converted) {
          treatmentConversions++;

          /*
           * REAL LaunchDarkly custom event.
           *
           * This is the same event used by the experiment metric:
           * demo-requested
           */
          ldClient.track("demo-requested", context, {
            source: "server-synthetic-demo",
            experience: "ai-advisor",
            synthetic: true,
            batchId,
          });
        }
      } else {
        // Control = Traditional Demo Request
        controlVisitors++;

        const converted = Math.random() < controlRate / 100;

        if (converted) {
          controlConversions++;

          ldClient.track("demo-requested", context, {
            source: "server-synthetic-demo",
            experience: "traditional",
            synthetic: true,
            batchId,
          });
        }
      }

      /*
       * Flush periodically so a large batch does not sit entirely
       * inside the SDK's analytics event buffer.
       */
      if (i % 20 === 0) {
        await ldClient.flush();
      }
    }

    // Make sure the final events are sent before returning.
    await ldClient.flush();

    const controlObservedRate =
      controlVisitors > 0
        ? Number(
            ((controlConversions / controlVisitors) * 100).toFixed(1)
          )
        : 0;

    const treatmentObservedRate =
      treatmentVisitors > 0
        ? Number(
            ((treatmentConversions / treatmentVisitors) * 100).toFixed(1)
          )
        : 0;

    return Response.json({
      success: true,

      batchId,
      visitorCount,

      control: {
        visitors: controlVisitors,
        conversions: controlConversions,
        observedConversionRate: `${controlObservedRate}%`,
      },

      treatment: {
        visitors: treatmentVisitors,
        conversions: treatmentConversions,
        observedConversionRate: `${treatmentObservedRate}%`,
      },

      note:
        "Visitor identities and conversion behavior are synthetic. LaunchDarkly flag evaluations, experiment exposures, and demo-requested events are real.",
    });
  } catch (error) {
    console.error("Synthetic traffic simulation failed:", error);

    return Response.json(
      {
        success: false,
        error: "Synthetic traffic simulation failed.",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}