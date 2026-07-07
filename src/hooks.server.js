// src/hooks.server.js
import { createServer } from '$lib/supabaseServer'
import { redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

export const handle = async({ event, resolve }) => {
  event.locals.supabase = createServer(event.cookies);

  const {
    data: { user }, error
  } = await event.locals.supabase.auth.getUser();
  event.locals.user = user;
  event.locals.session = error ? null: (await event.locals.supabase.auth.getSession()).data.session

  // Routes that must stay accessible without being logged in
  const publicRoutes = ['/login', '/auth/callback'];
  const isPublicRoute = publicRoutes.some((r) => event.url.pathname.startsWith(r));

  if (!user && !isPublicRoute) {
    throw redirect(303, '/login');
  }

  return resolve(event);
}