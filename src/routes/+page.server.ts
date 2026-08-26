// src/routes/+page.server.ts
//
// Drives the "Sambung Belajar" card. Picks, in order:
//   1. The most recently updated video_progress row that's unlocked for
//      this user and not yet marked watched — i.e. genuinely "in progress".
//   2. If nothing is in progress (new user, or their in-progress video got
//      relocked by a paid-status change), the first unlocked, unstarted
//      video in course order — a sensible "start here" default.
//   3. If the user has no accessible videos at all (shouldn't normally
//      happen), continueLesson is null and the component shows a generic
//      prompt instead.
//
// Google Drive lessons never appear as "in progress" here — Drive has no
// resume concept, only a binary watched flag (see the classroom page's
// markDriveWatched), so a Drive row is either absent or already watched.
//
// continueLesson is returned WITHOUT awaiting — SvelteKit streams it in
// once it resolves, so the rest of the page (menu tiles, tips, etc.)
// doesn't wait on this DB round-trip. See +page.svelte's {#await} block.
//
// announcements is fetched (and awaited) here, not streamed — it's a
// single small select against sidebar_content, generated server-side by
// the admin push action in /admin/sidebarDashboard whenever new content
// goes live.
//
// Two SEPARATE sources get combined here:
//   - manual_announcements: curated directly via /admin/announcementsDashboard,
//     never touched by a sidebar push.
//   - announcements: auto-generated as a side effect of a sidebar content
//     push (see admin/sidebarDashboard/+page.server.ts).
// Manual entries are shown first (pinned), auto-generated ones after —
// so a deliberate manual announcement never gets silently evicted by
// routine push activity.

import { getSectionsWithAccess, type AccessibleItem } from "$lib/sections";
import type { PageServerLoad } from "./$types";

const YOUTUBE_ID_PATTERN = /embed\/([A-Za-z0-9_-]+)/;

export const load: PageServerLoad = async ({ locals, cookies, platform }) => {
  const justPaid = cookies.get("just_paid") === "true";

  if (justPaid) {
    // Delete it right away so a page refresh clears the element
    cookies.delete("just_paid", { path: "/" });
  }

  const { data: sidebarRow, error: sidebarErr } = await locals.supabase
    .from("sidebar_content")
    .select("announcements, manual_announcements")
    .eq("id", "v1")
    .single();

  if (sidebarErr) {
    // Previously silent -- a failed read here (bad RLS policy, wrong
    // project, etc.) used to look identical to "no announcements exist",
    // making it impossible to tell apart from the logs.
    console.error("Failed to load sidebar_content announcements:", sidebarErr);
  }

  const announcements = [
    ...(sidebarRow?.manual_announcements ?? []),
    ...(sidebarRow?.announcements ?? []),
  ];

  return {
    showElement: justPaid,
    continueLesson: loadContinueLesson(locals, platform),
    announcements,
  };
};

async function loadContinueLesson(
  locals: App.Locals,
  platform: App.Platform | undefined,
) {
  if (!locals.user) {
    return null;
  }

  const { sections } = await getSectionsWithAccess(locals.user.id, platform);

  // Flatten to playable, unlocked items, remembering which section (=
  // "Modul N") each one belongs to.
  const accessibleItems: AccessibleItem[] = [];
  sections.forEach((section, sectionIndex) => {
    for (const item of section.items) {
      if (!item.locked && item.video) {
        accessibleItems.push({ ...item, moduleNumber: sectionIndex + 1 });
      }
    }
  });

  if (accessibleItems.length === 0) {
    return null;
  }

  const { data: rows, error } = await locals.supabase
    .from("video_progress")
    .select("item_id, resume_seconds, duration_seconds, updated_at")
    .eq("user_id", locals.user.id)
    .eq("watched", false)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Failed to load continue-learning progress:", error);
  }

  let continueItem = null;
  let progress = null;

  const inProgressRow = rows?.[0];
  if (inProgressRow) {
    // The most recent in-progress row might point at an item that's since
    // been relocked (paid status changed) or removed from the doc — if so,
    // fall through to the "start here" default below instead of showing
    // a dead lesson.
    continueItem =
      accessibleItems.find((item) => item.id === inProgressRow.item_id) ?? null;
    if (continueItem) progress = inProgressRow;
  }

  if (!continueItem) {
    continueItem = accessibleItems[0];
  }

  const durationSeconds = progress?.duration_seconds ?? null;
  const resumeSeconds = progress?.resume_seconds ?? 0;
  const progressPercent = durationSeconds
    ? Math.min(100, Math.round((resumeSeconds / durationSeconds) * 100))
    : 0;

  const youTubeId = continueItem.video?.match(YOUTUBE_ID_PATTERN)?.[1] ?? null;

  return {
    id: continueItem.id,
    moduleNumber: continueItem.moduleNumber,
    title: continueItem.label,
    progressPercent,
    durationLabel: formatDuration(durationSeconds),
    // No thumbnail API exists for Drive's /preview iframe (same
    // limitation as duration/resume) — the component falls back to a
    // generic icon when this is null.
    thumbnail: youTubeId
      ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`
      : null,
  };
}

function formatDuration(totalSeconds: number | null | undefined) {
  if (!totalSeconds) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
