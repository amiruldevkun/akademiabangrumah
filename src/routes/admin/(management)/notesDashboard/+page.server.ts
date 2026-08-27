// src/routes/admin/notes/+page.server.ts
//
// Deliberately simpler than /admin/sidebar: no parser, no preview step,
// no version history. Paste a Drive link, give it a title, done. If this
// ever needs the same "backup before overwrite" treatment as
// sidebar_content, add a documents_history table then — not before.

import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { supabaseAdmin } from "$lib/supabaseAdmin";
import { toDriveEmbedUrl } from "$lib/driveEmbed";

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

export const load: PageServerLoad = async ({ locals }) => {
  await requireAdmin(locals);

  // const { user } = await locals.safeGetSession();
  // const { data: profile, error: profileErr } = await locals.supabase
  //   .from("profiles")
  //   .select("is_admin")
  //   .eq("id", user.id)
  //   .single();

  // if (profileErr || !profile?.is_admin) {
  //   error(403, "Not authorized");
  // }

  const { data: documents } = await supabaseAdmin
    .from("documents")
    .select("id, title, drive_url, position")
    .order("position", { ascending: true });

  return { documents: documents ?? [] };
};

export const actions: Actions = {
  add: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title");
    const driveUrl = formData.get("driveUrl");

    if (typeof title !== "string" || title.trim().length === 0) {
      return fail(400, { message: "Title is required." });
    }
    if (typeof driveUrl !== "string" || driveUrl.trim().length === 0) {
      return fail(400, { message: "Google Drive link is required." });
    }

    const embedUrl = toDriveEmbedUrl(driveUrl.trim());
    if (!embedUrl) {
      return fail(400, {
        message:
          "Could not recognize that as a Google Drive file link. Make sure it's shared as 'Anyone with the link'.",
      });
    }

    const { data: maxPos } = await supabaseAdmin
      .from("documents")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const { error: insertErr } = await supabaseAdmin.from("documents").insert({
      id: crypto.randomUUID(),
      title: title.trim(),
      drive_url: driveUrl.trim(),
      embed_url: embedUrl,
      position: (maxPos?.position ?? 0) + 1,
    });

    if (insertErr) {
      console.error("Failed to insert document:", insertErr);
      return fail(500, { message: "Could not save — check logs." });
    }

    return { added: true };
  },

  remove: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    if (typeof id !== "string") {
      return fail(400, { message: "Missing id." });
    }

    const { error: deleteErr } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      console.error("Failed to delete document:", deleteErr);
      return fail(500, { message: "Could not delete — check logs." });
    }

    return { removed: true };
  },
};
