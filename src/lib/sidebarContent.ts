// src/lib/server/sidebarContent.ts
//
// Replaces the old `import rawSections from '$lib/sidebar-data.json'`.
// Fetches the sidebar tree from Supabase instead of bundling it.
//
// Caching strategy: since the admin push (see sidebarParser.ts / the admin
// page) bumps `version` on every write, we can check freshness with a tiny
// query (just an int) instead of guessing with a TTL. The full jsonb blob
// (~20KB) is only re-fetched when the version actually changed — so content
// updates show up on the next request after a push, not after some arbitrary
// cache window expires.
//
// Module-level cache: this resets on cold start (Netlify functions aren't
// guaranteed to stay warm), which is fine — worst case is one extra full
// fetch per cold start, and at ~20KB that's a non-issue either way.

import { supabaseAdmin } from '$lib/supabaseAdmin';

export type RawSectionItem = {
	id: string;
	label: string;
	video: string | null;
};

export type RawSection = {
	title: string;
	items: RawSectionItem[];
};

let cache: { content: RawSection[]; version: number } | null = null;

export async function getSidebarContent(): Promise<RawSection[]> {
	// Cheap check first — just the version int, not the full blob.
	const { data: meta, error: metaErr } = await supabaseAdmin
		.from('sidebar_content')
		.select('version')
		.eq('id', 'v1')
		.single();

	if (metaErr || !meta) {
		if (cache) {
			console.error('sidebar_content version check failed, serving stale cache:', metaErr);
			return cache.content;
		}
		throw new Error(`Failed to load sidebar content: ${metaErr?.message ?? 'no row found'}`);
	}

	if (cache && cache.version === meta.version) {
		return cache.content;
	}

	const { data, error } = await supabaseAdmin
		.from('sidebar_content')
		.select('content')
		.eq('id', 'v1')
		.single();

	if (error || !data) {
		if (cache) {
			console.error('sidebar_content fetch failed, serving stale cache:', error);
			return cache.content;
		}
		throw new Error(`Failed to load sidebar content: ${error?.message ?? 'no row found'}`);
	}

	cache = { content: data.content as RawSection[], version: meta.version };
	return cache.content;
}