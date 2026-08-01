// src/routes/notes/+page.server.ts
//
// "Nota & PDF" tile lands here. Lists every document; while NOTES_GATED
// (in $lib/config) is false everything is open for testing. Flip that one
// flag to true once your boss confirms it should be a paid perk — no
// other code here needs to change.

import { hasPaidAccess } from "$lib/access";
import { NOTES_GATED } from "$lib/config";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const { data: docs, error } = await locals.supabase
    .from("documents")
    .select("id, title")
    .order("position", { ascending: true });

  if (error) {
    console.error("Failed to load documents:", error);
  }

  let paid = true;
  if (NOTES_GATED) {
    paid = locals.user ? await hasPaidAccess(locals.user.id) : false;
  }

  return {
    documents: (docs ?? []).map((d) => ({
      ...d,
      locked: NOTES_GATED && !paid,
    })),
  };
};
