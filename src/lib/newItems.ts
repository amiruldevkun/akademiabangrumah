// src/lib/server/newItems.ts
//
// "New" is time-based and the same for every visitor: an item is highlighted
// for NEW_BADGE_DAYS after its id first appeared in sidebar_content. Rows in
// sidebar_item_first_seen are written once by the admin push action (see
// +page.server.ts) and never updated after that, so this is just a read.

import { supabaseAdmin } from "$lib/supabaseAdmin";

export const NEW_BADGE_DAYS = 14;

let cache: { ids: Set<string>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min — "new" is a fuzzy concept, doesn't need to be exact to the second

export async function getRecentlyAddedItemIds(): Promise<Set<string>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.ids;
  }

  const cutoff = new Date(
    Date.now() - NEW_BADGE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from("sidebar_item_first_seen")
    .select("item_id")
    .gte("first_seen_at", cutoff);

  if (error) {
    console.error("Failed to fetch recently-added item ids:", error);
    return cache?.ids ?? new Set(); // fail soft — worst case, badges just don't show this request
  }

  const ids = new Set((data ?? []).map((row) => row.item_id));
  cache = { ids, fetchedAt: Date.now() };
  return ids;
}
