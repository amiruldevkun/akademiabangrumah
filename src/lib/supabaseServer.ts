import { createServerClient } from "@supabase/ssr";

import type { Cookies } from "@sveltejs/kit";

export const createServer = (
  cookies: Cookies,
  platform: App.Platform | undefined,
) => {
  const PUBLIC_SUPABASE_URL = platform?.env.PUBLIC_SUPABASE_URL;
  const PUBLIC_SUPABASE_PUBLISHABLE_KEY =
    platform?.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase url or Supabase Key is not populated, debug me");
  }
  return createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    },
  );
};
