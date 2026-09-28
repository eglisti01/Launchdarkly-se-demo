import { init } from "@launchdarkly/node-server-sdk";
import { initAi } from "@launchdarkly/server-sdk-ai";

const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;
const configKey =
  process.env.LAUNCHDARKLY_AI_CONFIG_KEY || "elena-starter-chatbot";

const ldClient = sdkKey ? init(sdkKey) : null;
const aiClient = ldClient ? initAi(ldClient) : null;

export async function POST(request: Request) {
  if (!ldClient || !aiClient) {
    return Response.json(
      {
        error: "LaunchDarkly server SDK is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const problem =
      body.problem ||
      "We want to improve operational efficiency.";

    const userKey = body.userKey || "abc-demo-user";
    const userName = body.userName || "ABC Demo User";

    await ldClient.waitForInitialization({
      timeout: 10,
    });

    const context = {
      kind: "user",
      key: userKey,
      name: userName,
    };

    const fallbackConfig = {
      enabled: false,
    };

    const config = await aiClient.agentConfig(
      configKey,
      context,
      fallbackConfig,
      {
        problem,
      }
    );

    if (!config.enabled) {
      return Response.json(
        {
          error:
            "AgentControl config is disabled or unavailable.",
        },
        { status: 503 }
      );
    }

    return Response.json({
      success: true,

      configKey,

      model:
        config.model?.name ||
        "Model not returned",

      provider:
        config.provider?.name ||
        "Provider not returned",

      parameters:
        config.model?.parameters || {},

      instructions:
        config.instructions || "",
    });
  } catch (error) {
    console.error("AgentControl error:", error);

    return Response.json(
      {
        error:
          "Could not retrieve AgentControl configuration.",

        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}