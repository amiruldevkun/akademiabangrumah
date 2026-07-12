// src/lib/server/sections.js
//
// Shared paywall-enforcement logic for course sections. Both the
// classroom page and the home page's "Sambung Belajar" card need the
// exact same "which videos are actually unlocked for this user" answer —
// keeping the walk-and-lock logic in one place means they can't drift
// out of sync with each other as the free-tier rules evolve.

import { hasPaidAccess } from '$lib/access';
import { FREE_VIDEO_LIMIT } from '$lib/config';
import rawSections from '$lib/sidebar-data.json';

/**
 * @param {string | undefined | null} userId
 * @returns {Promise<{ sections: any[], paid: boolean }>}
 */
export async function getSectionsWithAccess(userId) {
	const paid = userId ? await hasPaidAccess(userId) : false;

	let freeVideosLeft = FREE_VIDEO_LIMIT;

	const sections = rawSections.map((section) => ({
		...section,
		items: section.items.map((item) => {
			// "Coming soon" — not paywalled, just not released yet.
			if (!item.video) {
				return { ...item, locked: false };
			}

			if (paid || freeVideosLeft > 0) {
				if (!paid) freeVideosLeft -= 1;
				return { ...item, locked: false };
			}

			// Locked — strip the real video URL entirely. Only label + id survive.
			return { id: item.id, label: item.label, video: null, locked: true };
		})
	}));

	return { sections, paid };
}