import posthog from "posthog-js";
import { env } from "$env/dynamic/public";

export function capturePostHog(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (!env.PUBLIC_POSTHOG_PROJECT_TOKEN || !env.PUBLIC_POSTHOG_HOST) return;

  posthog.capture(event, properties);
}
