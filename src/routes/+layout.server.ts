// src/routes/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import { hasPaidAccess, hasAdminAccess } from "$lib/access";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const PUBLICROUTE = ["/pay_landing", "/payment/return"];
  const lockedRoute = ["/landing", "/login"];
  const adminRoute = ["/admin"];

  if (!locals.user) {
    return { session: null, user: null, admin: null };
  }

  if (PUBLICROUTE.includes(url.pathname)) {
    return { session: locals.session, user: locals.user };
  }
  const paid = await hasPaidAccess(locals.user.id);

  const admin = await hasAdminAccess(locals.user.id);

  if (!paid) {
    redirect(303, "/pay_landing"); // back to the payment landing page
  }

  if (!admin && adminRoute.includes(url.pathname)) {
    redirect(303, "/"); // back to the main page
  }

  if (locals.session && lockedRoute.includes(url.pathname)) {
    redirect(303, "/");
  }

  return {
    session: locals.session,
    user: locals.user,
    admin,
  };
};
