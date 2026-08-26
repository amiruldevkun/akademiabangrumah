import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { getSupabaseAdmin } from "$lib/supabaseAdmin";

export const load: PageServerLoad = async ({ locals, platform }) => {
  const { session } = await locals.safeGetSession();
  if (!session) throw redirect(303, "/login");

  const { data: profile, error } = await locals.supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, is_admin")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Failed to load profile:", error);
  }

  // Reconcile avatar_url against the latest OAuth provider metadata (e.g. Google).
  // Google's avatar always wins here since manual upload isn't implemented yet —
  // once it is, gate this behind an avatar_source column so a synced Google
  // avatar doesn't overwrite a user's own upload.
  const providerAvatarUrl = session.user.user_metadata?.avatar_url as
    | string
    | undefined;

  let resolvedProfile = profile;

  if (
    providerAvatarUrl &&
    profile &&
    profile.avatar_url !== providerAvatarUrl
  ) {
    const supabaseAdmin = getSupabaseAdmin(platform);

    const { data: updated, error: reconcileError } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: providerAvatarUrl })
      .eq("id", session.user.id)
      .select("id, full_name, email, avatar_url, is_admin")
      .single();

    if (reconcileError) {
      console.error("Failed to reconcile avatar_url:", reconcileError);
    } else {
      resolvedProfile = updated;
    }
  }

  return {
    profile: resolvedProfile ?? {
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name ?? "",
      email: session.user.email ?? "",
      avatar_url: providerAvatarUrl ?? "",
      is_admin: session.user.user_metadata?.is_admin ?? false,
    },
  };
};

export const actions: Actions = {
  updateProfile: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) throw redirect(303, "/login");

    const formData = await request.formData();
    const full_name = (formData.get("full_name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();

    if (!full_name) {
      return fail(400, { error: "Nama penuh diperlukan", full_name, email });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, { error: "Format emel tidak sah", full_name, email });
    }

    const { error } = await locals.supabase
      .from("profiles")
      .update({ full_name, email })
      .eq("id", session.user.id);

    if (error) {
      console.error("Failed to update profile:", error);
      return fail(500, {
        error: "Gagal mengemaskini profil. Sila cuba lagi.",
        full_name,
        email,
      });
    }

    // reload user profile after sending the updated info
    const { data: profile, error: profError } = await locals.supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, is_admin")
      .eq("id", session.user.id)
      .single();

    if (profError) {
      console.error("Failed to load profile:", error);
    }

    return { success: true };
  },
};
