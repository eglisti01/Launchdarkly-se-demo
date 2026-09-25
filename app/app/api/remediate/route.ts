export async function POST() {
  const triggerUrl = process.env.LAUNCHDARKLY_TRIGGER_URL;

  if (!triggerUrl) {
    return Response.json(
      {
        error: "LaunchDarkly trigger URL is missing.",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(triggerUrl, {
      method: "POST",
    });

    if (!response.ok) {
      const details = await response.text();

      return Response.json(
        {
          error: "LaunchDarkly trigger failed.",
          launchDarklyStatus: response.status,
          details,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Remediation trigger fired.",
    });
  } catch (error) {
    return Response.json(
      {
        error: "Could not reach LaunchDarkly trigger.",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}