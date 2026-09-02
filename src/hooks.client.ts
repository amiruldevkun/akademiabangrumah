import type { HandleClientError } from "@sveltejs/kit";
import { dev } from "$app/environment";
import {
  PUBLIC_POSTHOG_HOST,
  PUBLIC_POSTHOG_PROJECT_TOKEN,
} from "$env/static/public";
import posthog from "posthog-js";

let posthogInitialized = false;

export async function init() {
  const token = PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = PUBLIC_POSTHOG_HOST;

  if (!token || !host) {
    if (dev) {
      const missingVariable = !token
        ? "PUBLIC_POSTHOG_PROJECT_TOKEN"
        : "PUBLIC_POSTHOG_HOST";
      console.error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      );
    }
    return;
  }

  posthog.init(token, {
    api_host: host,
    defaults: "2026-01-30",
    capture_exceptions: true,
  });
  posthogInitialized = true;
}

export const handleError: HandleClientError = ({ error }) => {
  if (posthogInitialized) {
    posthog.captureException(error);
  }
};
