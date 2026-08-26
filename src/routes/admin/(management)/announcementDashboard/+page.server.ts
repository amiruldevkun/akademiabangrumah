// src/routes/admin/(management)/announcementsDashboard/+page.server.ts
//
// Standalone add/edit/remove for manually-created homepage "PENGUMUMAN"
// items. These live in their own `manual_announcements` jsonb column on
// the sidebar_content row (id: 'v1') -- deliberately SEPARATE from the
// `announcements` column that the sidebar push action auto-generates into
// (see admin/sidebarDashboard/+page.server.ts). That push action only ever
// writes to `announcements`, so it can never evict something added here.
//
// `text` supports inline markdown (**bold**, *italic*, [text](url)) --
// rendered safely via $lib/markdown.ts wherever it's displayed. Raw
// markdown is stored as-is, not pre-rendered, so it stays editable.
//
// The homepage load (src/routes/+page.server.ts) reads both columns and
// shows manual ones first, auto-generated ones after.
//
// Deliberately does NOT touch `version` or `updated_at` on the row: those
// reflect sidebar *content* freshness, not announcement edits, and bumping
// them here would make an unrelated content push look newer than it is.

import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getSupabaseAdmin } from "$lib/supabaseAdmin";

type Announcement = {
  id: string;
  text: string;
  created_at: string;
};

// Higher than the auto-generated cap (5) since these are deliberate,
// admin-curated entries rather than a side effect of routine content pushes.
const MAX_MANUAL_ANNOUNCEMENTS = 10;

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

async function getManualAnnouncements(
  platform: App.Platform | undefined,
): Promise<Announcement[]> {
  const supabaseAdmin = getSupabaseAdmin(platform);
  const { data } = await supabaseAdmin
    .from("sidebar_content")
    .select("manual_announcements")
    .eq("id", "v1")
    .single();

  return (data?.manual_announcements as Announcement[] | null) ?? [];
}

export const load: PageServerLoad = async ({ locals, platform }) => {
  await requireAdmin(locals);
  return { announcements: await getManualAnnouncements(platform) };
};

export const actions: Actions = {
  add: async ({ request, platform }) => {
    const formData = await request.formData();
    const text = formData.get("text");

    if (typeof text !== "string" || text.trim().length === 0) {
      return fail(400, { message: "Text is required." });
    }

    const current = await getManualAnnouncements(platform);
    const next: Announcement[] = [
      {
        id: crypto.randomUUID(),
        text: text.trim(),
        created_at: new Date().toISOString(),
      },
      ...current,
    ].slice(0, MAX_MANUAL_ANNOUNCEMENTS);

    const supabaseAdmin = getSupabaseAdmin(platform);

    const { error: updateErr } = await supabaseAdmin
      .from("sidebar_content")
      .update({ manual_announcements: next })
      .eq("id", "v1");

    if (updateErr) {
      console.error("Failed to add manual announcement:", updateErr);
      return fail(500, { message: "Could not save — check logs." });
    }

    return { added: true };
  },

  update: async ({ request, platform }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    const text = formData.get("text");

    if (typeof id !== "string") return fail(400, { message: "Missing id." });
    if (typeof text !== "string" || text.trim().length === 0) {
      return fail(400, { message: "Text is required." });
    }

    const current = await getManualAnnouncements(platform);
    const next = current.map((a) =>
      a.id === id ? { ...a, text: text.trim() } : a,
    );

    const supabaseAdmin = getSupabaseAdmin(platform);

    const { error: updateErr } = await supabaseAdmin
      .from("sidebar_content")
      .update({ manual_announcements: next })
      .eq("id", "v1");

    if (updateErr) {
      console.error("Failed to update manual announcement:", updateErr);
      return fail(500, { message: "Could not save — check logs." });
    }

    return { updated: true };
  },

  remove: async ({ request, platform }) => {
    const formData = await request.formData();
    const id = formData.get("id");
    if (typeof id !== "string") return fail(400, { message: "Missing id." });

    const current = await getManualAnnouncements(platform);
    const next = current.filter((a) => a.id !== id);

    const supabaseAdmin = getSupabaseAdmin(platform);

    const { error: updateErr } = await supabaseAdmin
      .from("sidebar_content")
      .update({ manual_announcements: next })
      .eq("id", "v1");

    if (updateErr) {
      console.error("Failed to remove manual announcement:", updateErr);
      return fail(500, { message: "Could not save — check logs." });
    }

    return { removed: true };
  },
};
