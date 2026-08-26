// src/lib/server/supabaseAdmin.js

import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(platform: App.Platform | undefined) {
  const url = platform?.env?.PUBLIC_SUPABASE_URL;
  const key = platform?.env?.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("platform is undefined, debug me");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
