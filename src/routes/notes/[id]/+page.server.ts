// src/routes/notes/[id]/+page.server.ts
//
// Re-checks the gate here too, not just on the list page — someone could
// bookmark or share a direct /notes/[id] link once NOTES_GATED flips on.

import { error } from "@sveltejs/kit";
import { hasPaidAccess } from "$lib/access";
import { NOTES_GATED } from "$lib/config";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { data: doc, error: fetchErr } = await locals.supabase
    .from("documents")
    .select("id, title, embed_url, drive_url")
    .eq("id", params.id)
    .single();

  if (fetchErr || !doc) {
    error(404, "Nota tidak dijumpai");
  }

  if (NOTES_GATED) {
    const paid = locals.user ? await hasPaidAccess(locals.user.id) : false;
    if (!paid) {
      error(403, "Nota ini untuk ahli sahaja");
    }
  }

  return { document: doc };
};
