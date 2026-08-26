// src/lib/server/sections.ts
//
// Shared paywall-enforcement logic for course sections. Both the
// classroom page and the home page's "Sambung Belajar" card need the
// exact same "which videos are actually unlocked for this user" answer —
// keeping the walk-and-lock logic in one place means they can't drift
// out of sync with each other as the free-tier rules evolve.
//
// CHANGED: raw section data now comes from Supabase (getSidebarContent)
// instead of a bundled sidebar-data.json. Everything below the fetch is
// untouched — same locking logic, same shape in, same shape out.

import { hasPaidAccess } from "$lib/access";
import { FREE_VIDEO_LIMIT } from "$lib/config";
import { getSidebarContent, type RawSection } from "$lib/sidebarContent";
import { getRecentlyAddedItemIds } from "$lib/newItems";

export type CourseItem = {
  id: string;
  label: string;
  video: string | null;
  locked: boolean;
  isNew: boolean;
};

export type CourseSection = {
  title: string;
  items: CourseItem[];
};

export type AccessibleItem = CourseItem & {
  moduleNumber: number;
};

export async function getSectionsWithAccess(
  userId: string | null | undefined,
  platform: App.Platform | undefined,
): Promise<{ sections: CourseSection[]; paid: boolean }> {
  const paid = userId ? await hasPaidAccess(userId, platform) : false;
  let freeVideosLeft = FREE_VIDEO_LIMIT;

  const rawSections = await getSidebarContent(platform);
  const newIds = await getRecentlyAddedItemIds(platform);

  const sections: CourseSection[] = rawSections.map((section: RawSection) => ({
    title: section.title,
    items: section.items.map((item): CourseItem => {
      const isNew = newIds.has(item.id);

      // "Coming soon" — not paywalled, just not released yet.
      if (!item.video) {
        return { ...item, locked: false, isNew };
      }

      if (paid || freeVideosLeft > 0) {
        if (!paid) freeVideosLeft -= 1;
        return { ...item, locked: false, isNew };
      }

      // Locked — strip the real video URL entirely. Only label + id survive.
      return {
        id: item.id,
        label: item.label,
        video: null,
        locked: true,
        isNew,
      };
    }),
  }));

  return { sections, paid };
}
