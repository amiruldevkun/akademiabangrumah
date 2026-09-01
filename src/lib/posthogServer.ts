// src/lib/posthog-server.ts
//
// SERVER ONLY. This is separate from the posthog-js browser singleton in
// hooks.client.ts — webhooks have no browser session, so events here are
// always keyed off the order's authenticated user_id, never a client-side
// distinct_id.

import { PostHog } from "posthog-node";
import {
  PUBLIC_POSTHOG_PROJECT_TOKEN,
  PUBLIC_POSTHOG_HOST,
} from "$env/static/public";

let client: PostHog | null = null;

export function getPostHogServer() {
  if (client) return client;

  if (!PUBLIC_POSTHOG_PROJECT_TOKEN || !PUBLIC_POSTHOG_HOST) {
    console.warn(
      "[posthog-server] missing config — server events will not be captured",
    );
    return null;
  }

  client = new PostHog(PUBLIC_POSTHOG_PROJECT_TOKEN, {
    host: PUBLIC_POSTHOG_HOST,
    // Cloudflare Workers don't have a long-lived process for the default
    // background batching/flush interval to run in — the isolate can be
    // torn down right after the response is sent. Flush explicitly per
    // request instead (see +server.ts) and disable the timer-based flush.
    flushAt: 1,
    flushInterval: 0,
  });

  return client;
}
