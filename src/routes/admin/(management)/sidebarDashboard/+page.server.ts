// src/routes/admin/(management)/sidebarDashboard/+page.server.ts
//
// Matches your actual hooks.server.ts (locals.safeGetSession() / locals.supabase)
// and supabaseAdmin.ts (service-role client using the new secret-key format).
//
// One thing worth knowing: hooks.server.ts already redirects any logged-out
// visitor to /login for every route not in `publicRoutes` — so this route
// is already login-gated for free. This load function only needs to add the
// is_admin check on top of that, not re-implement the login redirect.
//
// Announcement format: `text` holds inline markdown (**bold**, *italic*,
// [text](url)) — rendered safely via $lib/markdown.ts wherever it's shown.
// This matches the format used by the manual announcement editor at
// admin/(management)/announcementsDashboard, so both sources render
// identically on the homepage regardless of which one produced them.

import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { parseSidebarText } from "$lib/sidebarParser";
import { supabaseAdmin } from "$lib/supabaseAdmin";

// Section titles come out of the parser UPPERCASE (e.g. "KERJA ATAP &
// BUMBUNG") — prettify for display in the homepage announcement feed.
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

type Announcement = {
  id: string;
  text: string;
  created_at: string;
};

const MAX_ANNOUNCEMENTS = 5;

export const load: PageServerLoad = async ({ locals }) => {
  // locals.user is already populated by hooks.server.ts, and hooks.server.ts
  // has already redirected to /login if it's null — but we re-check safely
  // in case this route ever gets added to publicRoutes by accident.
  const { user } = await locals.safeGetSession();

  if (!user) {
    error(401, "Not authenticated");
  }

  const { data: profile, error: profileErr } = await locals.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile?.is_admin) {
    error(403, "Not authorized");
  }

  const { data: current } = await supabaseAdmin
    .from("sidebar_content")
    .select("version, updated_at")
    .eq("id", "v1")
    .single();

  return {
    currentVersion: current?.version ?? null,
    currentUpdatedAt: current?.updated_at ?? null,
  };
};

export const actions: Actions = {
  // Runs the parser only — does NOT touch the database. Lets the admin
  // eyeball the result before committing to anything.
  parse: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession();
    if (!user) return fail(401, { message: "Not authenticated" });

    const formData = await request.formData();
    const rawText = formData.get("rawText");

    if (typeof rawText !== "string" || rawText.trim().length === 0) {
      return fail(400, { message: "Paste the exported doc text first." });
    }

    try {
      const result = parseSidebarText(rawText);
      return { parsed: result, rawText };
    } catch (e) {
      console.error("Sidebar parse failed:", e);
      return fail(500, { message: "Parsing failed — check the console/logs." });
    }
  },

  // Takes the already-parsed JSON (submitted back as a hidden field so we
  // don't re-parse and risk a different result than what was previewed)
  // and pushes it to Supabase, backing up the previous version first.
  push: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession();
    if (!user) return fail(401, { message: "Not authenticated" });

    const { data: profile } = await locals.supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return fail(403, { message: "Not authorized" });
    }

    const formData = await request.formData();
    const sectionsJson = formData.get("sectionsJson");

    if (typeof sectionsJson !== "string") {
      return fail(400, {
        message: "Missing parsed content — parse again before pushing.",
      });
    }

    let sections;
    try {
      sections = JSON.parse(sectionsJson);
    } catch {
      return fail(400, {
        message: "Parsed content was corrupted — parse again.",
      });
    }

    // 1. Read current row so we can back it up before overwriting.
    const { data: existing, error: readErr } = await supabaseAdmin
      .from("sidebar_content")
      .select("content, version, announcements")
      .eq("id", "v1")
      .single();

    if (readErr) {
      console.error("Failed to read current sidebar_content:", readErr);
      return fail(500, {
        message: "Could not read current content before backing it up.",
      });
    }

    // 2. Stash the outgoing version into history — this is your "git revert".
    const { error: historyErr } = await supabaseAdmin
      .from("sidebar_content_history")
      .insert({
        content: existing.content,
        version: existing.version,
        announcements: existing.announcements ?? [],
        created_by: user.id,
      });

    if (historyErr) {
      console.error("Failed to write sidebar_content_history:", historyErr);
      return fail(500, {
        message: "Could not back up current content — push aborted.",
      });
    }

    // 2b. Figure out which item ids are genuinely new (weren't in the
    // previous content at all) and record when they first appeared.
    // `first_seen_at` is only ever inserted, never updated, so re-pushing
    // the same content doesn't reset anyone's "new" clock.
    const oldIds = new Set<string>(
      (existing.content as { items: { id: string }[] }[]).flatMap((s) =>
        s.items.map((i) => i.id),
      ),
    );
    const newIds: string[] = (sections as { items: { id: string }[] }[])
      .flatMap((s) => s.items.map((i) => i.id))
      .filter((id) => !oldIds.has(id));

    if (newIds.length > 0) {
      const { error: firstSeenErr } = await supabaseAdmin
        .from("sidebar_item_first_seen")
        .upsert(
          newIds.map((id) => ({ item_id: id })),
          { onConflict: "item_id", ignoreDuplicates: true },
        );

      if (firstSeenErr) {
        // Don't abort the whole push over this — the content update is
        // the important part. Just log it; worst case some new items
        // don't get a "New" badge this round.
        console.error("Failed to record first-seen ids:", firstSeenErr);
      }
    }

    // 2c. Turn the newIds diff into human-readable announcements for the
    // homepage "PENGUMUMAN" box. Grouped by section so "5 new videos in
    // one module" becomes one line, not five. A section title that didn't
    // exist before -> "new module" wording; one that did -> "new videos
    // added to <module>" wording. The module name is wrapped in **...**
    // so it renders bold, matching the manual announcement editor's format.
    let mergedAnnouncements: Announcement[] =
      (existing.announcements as Announcement[] | null) ?? [];

    if (newIds.length > 0) {
      const oldTitles = new Set<string>(
        (existing.content as { title: string }[]).map((s) => s.title),
      );

      const idToSectionTitle = new Map<string, string>();
      for (const s of sections as {
        title: string;
        items: { id: string }[];
      }[]) {
        for (const item of s.items) {
          idToSectionTitle.set(item.id, s.title);
        }
      }

      const newCountByTitle = new Map<string, number>();
      for (const id of newIds) {
        const title = idToSectionTitle.get(id);
        if (!title) continue;
        newCountByTitle.set(title, (newCountByTitle.get(title) ?? 0) + 1);
      }

      const now = new Date().toISOString();
      const generated: Announcement[] = [];

      for (const [title, count] of newCountByTitle) {
        const prettyTitle = toTitleCase(title);
        generated.push({
          id: crypto.randomUUID(),
          text: oldTitles.has(title)
            ? `${count} video baru ditambah dalam modul **${prettyTitle}**`
            : `Modul baru telah ditambah: **${prettyTitle}**`,
          created_at: now,
        });
      }

      mergedAnnouncements = [...generated, ...mergedAnnouncements].slice(
        0,
        MAX_ANNOUNCEMENTS,
      );
    }

    // 3. Upsert the new content, bumping the version.
    const { error: upsertErr } = await supabaseAdmin
      .from("sidebar_content")
      .update({
        content: sections,
        version: existing.version + 1,
        updated_at: new Date().toISOString(),
        announcements: mergedAnnouncements,
      })
      .eq("id", "v1");

    if (upsertErr) {
      console.error("Failed to upsert sidebar_content:", upsertErr);
      return fail(500, {
        message:
          "Backup succeeded but the push itself failed. Nothing live was changed.",
      });
    }

    return { pushed: true, newVersion: existing.version + 1 };
  },
};
