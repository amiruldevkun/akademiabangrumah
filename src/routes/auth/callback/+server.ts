// src/routes/auth/callback/+server.ts
import { redirect } from "@sveltejs/kit";
import { hasPaidAccess } from "$lib/access";

export async function GET({ url, locals, platform }) {
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // User cancelled, denied access, Google returned some other error — OR
  // this is a stale/replayed callback URL (back/forward button) whose
  // one-time state cookie is already gone. Before treating this as fatal,
  // check whether the visitor is actually already logged in from an
  // earlier successful run through this same flow.
  if (error) {
    const { user } = await locals.safeGetSession();
    if (user) {
      console.warn(
        `OAuth callback replay for already-logged-in user (${error}: ${errorDescription}) — routing onward instead of showing an error.`,
      );
      const paid = await hasPaidAccess(user.id, platform);
      throw redirect(303, paid ? "/" : "/pay_landing");
    }

    console.warn("OAuth error:", error, errorDescription);
    throw redirect(
      303,
      `/login?error=${encodeURIComponent(errorDescription || error)}`,
    );
  }

  if (code) {
    const {
      data: { session },
      error: exchangeError,
    } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      // Same idea: a stale/already-used code fails here with an error,
      // but if the user already has a valid session, don't scare them.
      const { user } = await locals.safeGetSession();
      if (user) {
        console.warn(
          `Code exchange failed (${exchangeError.message}) but user already has a valid session — routing onward.`,
        );
        const paid = await hasPaidAccess(user.id, platform);
        throw redirect(303, paid ? "/" : "/pay_landing");
      }

      console.error("Session exchange failed:", exchangeError.message);
      throw redirect(
        303,
        `/login?error=${encodeURIComponent(exchangeError.message)}`,
      );
    }

    if (!session?.user) {
      // No error, but also no session — happens with a stale/already-used
      // code (e.g. back/forward button replay). Check for an existing
      // session before assuming this visitor needs to log in again.
      const { user } = await locals.safeGetSession();
      if (user) {
        console.warn(
          "Exchange returned no session, but user already has a valid one — routing onward.",
        );
        const paid = await hasPaidAccess(user.id, platform);
        throw redirect(303, paid ? "/" : "/pay_landing");
      }

      console.warn(
        "Exchange succeeded with no error, but session/user was null",
      );
      throw redirect(303, "/login");
    }

    const paid = await hasPaidAccess(session.user.id, platform);
    throw redirect(303, paid ? "/" : "/pay_landing");
  }

  // Neither a code nor an error param. Check for an existing session before
  // assuming this is a dead-end — landing here directly with a valid
  // session shouldn't force a re-login either.
  const { user } = await locals.safeGetSession();
  if (user) {
    const paid = await hasPaidAccess(user.id, platform);
    throw redirect(303, paid ? "/" : "/pay_landing");
  }

  throw redirect(303, "/login");
}
