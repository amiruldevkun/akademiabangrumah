// src/hooks.server.ts
import { createServer } from "$lib/supabaseServer";
import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServer(event.cookies);

  // safeGetSession: never let an auth error crash the request. If the
  // refresh token is invalid/stale/missing (e.g. leftover cookie from a
  // previous Supabase project or key rotation), treat the visitor as
  // logged out instead of throwing a 500.
  event.locals.safeGetSession = async () => {
    try {
      const {
        data: { user },
        error,
      } = await event.locals.supabase.auth.getUser();

      if (error || !user) {
        return { session: null, user: null };
      }

      const {
        data: { session },
      } = await event.locals.supabase.auth.getSession();

      return { session, user };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Auth session error (treating as logged out):", message);
      return { session: null, user: null };
    }
  };

  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  const publicRoutes = [
    "/login",
    "/auth/callback",
    "/auth/confirm",
    "/auth/error",
    "/payment/callback",
    "/payment/return",
    "/pay_landing",
    "/landing",
    "/about",
    "/sitemap.xml",
    "/sign_up",
  ];
  const isPublicRoute = publicRoutes.some((r) =>
    event.url.pathname.startsWith(r),
  );

  if (!user && !isPublicRoute) {
    throw redirect(303, "/landing");
  }

  return resolve(event);
};
