// src/routes/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import { hasPaidAccess } from "$lib/access";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  let PUBLICROUTE = ["/pay_landing", "/auth/reset_password"];
  let lockedRoute = ["/landing", "/login"];
  let loginRoute = ["/login", "/sign_up"];
  if (!locals.user) {
    return { session: null, user: null };
  }

  if (PUBLICROUTE.includes(url.pathname)) {
    return { session: locals.session, user: locals.user };
  }
  const paid = await hasPaidAccess(locals.user.id);

  if (!paid) {
    redirect(303, "/pay_landing"); // back to the payment landing page
  }
  if (locals.session && lockedRoute.includes(url.pathname)) {
    redirect(303, "/");
  }
  return {
    session: locals.session,
    user: locals.user,
  };
};
