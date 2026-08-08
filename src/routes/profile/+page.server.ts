import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
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

  return {
    profile: profile ?? {
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name ?? "",
      email: session.user.email ?? "",
      avatar_url: session.user.user_metadata?.avatar_url ?? "",
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

    return { success: true };
  },
};
