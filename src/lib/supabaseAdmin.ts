// src/lib/server/supabaseAdmin.js
//
// SERVER ONLY. Never import this from a .svelte file or anything that ships
// to the browser. This uses a Supabase *secret key* (sb_secret_...), which
// grants full access via the service_role Postgres role and bypasses Row
// Level Security. Only import it from +server.js / +page.server.js files.
//
// Supabase now recommends secret keys over the legacy service_role JWT —
// same elevated access, but revocable/rotatable independently and rejected
// outright if anyone ever tries to use it from a browser.
// Get yours from: Project Settings -> API Keys -> Secret keys.

import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
	auth: { persistSession: false }
});