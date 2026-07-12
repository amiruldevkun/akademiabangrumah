// src/routes/classroom/+page.server.js
//
// Real enforcement happens in $lib/server/sections.js (shared with the
// home page's "Sambung Belajar" card), not in the component. This file
// just merges per-user watched/resume progress on top of the
// already-paywalled sections.

import { getSectionsWithAccess } from '$lib/sections.js';

export async function load({ locals }) {
	const { sections: accessSections, paid } = await getSectionsWithAccess(locals.user?.id);

	// locals.supabase is the SSR client hooks.server.js creates via
	// createServer(cookies) — bound to the visitor's own session/cookies,
	// so RLS (auth.uid() = user_id) scopes this query to their own rows.
	let progressByItemId = {};
	if (locals.user) {
		const { data: rows, error } = await locals.supabase
			.from('video_progress')
			.select('item_id, watched, resume_seconds')
			.eq('user_id', locals.user.id);

		if (error) {
			console.error('Failed to load video progress:', error);
		} else {
			progressByItemId = Object.fromEntries(rows.map((r) => [r.item_id, r]));
		}
	}

	// Merge progress onto unlocked items only — a locked item's watched/resume
	// state shouldn't leak to a non-payer any more than its video URL does.
	const sections = accessSections.map((section) => ({
		...section,
		items: section.items.map((item) => {
			if (item.locked || !item.video) return item;

			const progress = progressByItemId[item.id];
			return {
				...item,
				watched: progress?.watched ?? false,
				resumeSeconds: progress?.resume_seconds ?? 0
			};
		})
	}));

	return {
		sections,
		hasPaid: paid,
		userId: locals.user?.id ?? null
	};
}