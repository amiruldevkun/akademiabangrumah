// src/routes/admin/(management)/usersDashboard/+page.server.ts
//
// Manual override for is_admin / has_paid on profiles -- for cases outside
// the normal ToyyibPay flow (bank transfer, comped access, promoting or
// demoting an admin). Search-first: does NOT list all users by default,
// since that'd be an unbounded query as the user base grows.

import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { supabaseAdmin } from "$lib/supabaseAdmin";

async function requireAdmin(locals: App.Locals) {
  const { user } = await locals.safeGetSession();
  if (!user) error(401, "Not authenticated");

  const { data: profile } = await locals.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) error(403, "Not authorized");

  return user;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const currentUser = await requireAdmin(locals);

  const search = (url.searchParams.get("q")?.trim() ?? "").replace(
    /[,()%]/g,
    "",
  );

  if (!search) {
    return { profiles: [], search: "", currentUserId: currentUser.id };
  }

  const { data: profiles, error: fetchErr } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, has_paid, paid_at, is_admin, created_at")
    .ilike("email", `%${search}%`)
    .limit(20);

  if (fetchErr) {
    console.error("Failed to search profiles:", fetchErr);
    return { profiles: [], search, currentUserId: currentUser.id };
  }

  return { profiles: profiles ?? [], search, currentUserId: currentUser.id };
};

export const actions: Actions = {
  toggleAdmin: async ({ request, locals }) => {
    const currentUser = await requireAdmin(locals);

    const formData = await request.formData();
    const id = formData.get("id");
    if (typeof id !== "string")
      return fail(400, { message: "Missing user id." });

    // Block an admin from removing their own is_admin flag through this UI
    // -- easy way to accidentally lock yourself out of /admin with no one
    // left to flip it back through the UI. Still possible via direct SQL
    // if that's genuinely what you want.
    if (id === currentUser.id) {
      return fail(400, {
        message: "You can't change your own admin status here.",
      });
    }

    const { data: target, error: readErr } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", id)
      .single();

    if (readErr || !target) {
      return fail(404, { message: "User not found." });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ is_admin: !target.is_admin })
      .eq("id", id);

    if (updateErr) {
      console.error("Failed to toggle is_admin:", updateErr);
      return fail(500, { message: "Could not update — check logs." });
    }

    return { toggled: "admin", id };
  },

  toggleHasPaid: async ({ request, locals }) => {
    await requireAdmin(locals);

    const formData = await request.formData();
    const id = formData.get("id");
    if (typeof id !== "string")
      return fail(400, { message: "Missing user id." });

    const { data: target, error: readErr } = await supabaseAdmin
      .from("profiles")
      .select("has_paid")
      .eq("id", id)
      .single();

    if (readErr || !target) {
      return fail(404, { message: "User not found." });
    }

    const nextHasPaid = !target.has_paid;
    const updatePayload: Record<string, unknown> = { has_paid: nextHasPaid };
    // Same pattern as the orders override: only stamp paid_at when turning
    // ON, never clear it when turning off, so the original paid date isn't
    // lost if access is revoked and re-granted later.
    if (nextHasPaid) {
      updatePayload.paid_at = new Date().toISOString();
    }

    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr) {
      console.error("Failed to toggle has_paid:", updateErr);
      return fail(500, { message: "Could not update — check logs." });
    }

    return { toggled: "paid", id };
  },
};
