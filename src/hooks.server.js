// src/hooks.server.js
import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export async function handle({ event, resolve }) {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });

  const {
    data: { session }
  } = await event.locals.supabase.auth.getSession();
  event.locals.session = session;

  // Routes that must stay accessible without being logged in
  const publicRoutes = ['/login', '/auth/callback'];
  const isPublicRoute = publicRoutes.some((r) => event.url.pathname.startsWith(r));

  if (!session && !isPublicRoute) {
    throw redirect(303, '/login');
  }

  return resolve(event);
}