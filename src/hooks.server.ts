// src/hooks.server.ts
import { createServer } from "$lib/supabaseServer";
import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

function isRecoverySession(accessToken: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64").toString(),
    );
    return (
      payload.amr?.some((entry: any) => entry.method === "recovery") ?? false
    );
  } catch {
    return false;
  }
}

export const authGuard: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServer(event.cookies, event.platform);

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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
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
    "/forgot_password",
    "/auth/confirm_reset",
  ];
  const isPublicRoute = publicRoutes.some((r) =>
    event.url.pathname.startsWith(r),
  );

  if (!user && !isPublicRoute) {
    throw redirect(303, "/landing");
  }

  // Recovery-session gate: no matter what route they try to hit, if this
  // is a password-recovery session, force them to finish resetting first.
  const recoveryAllowedRoutes = [
    "/auth/reset_password",
    "/auth/callback",
    "/auth/error",
  ];
  if (
    session &&
    isRecoverySession(session.access_token) &&
    !recoveryAllowedRoutes.some((r) => event.url.pathname.startsWith(r))
  ) {
    throw redirect(303, "/auth/reset_password");
  }

  return resolve(event);
};

const securityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // CSP is now handled by SvelteKit's kit.csp config — do NOT set it here,
  // setting it manually would conflict with the auto-nonce SvelteKit injects
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
};

export const handle = sequence(authGuard, securityHeaders);
