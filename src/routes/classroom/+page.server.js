// src/routes/classroom/+page.server.js
//
// Real enforcement happens here, not in the component. Walks the
// sections in order and counts real videos (video !== null) — the first
// FREE_VIDEO_LIMIT of those, across the WHOLE course, stay playable. Every
// one after that gets its real video URL stripped server-side if the user
// hasn't paid, so a non-paying visitor's network response never contains
// a locked video's actual link.
//
// `video === null` items ("Akan Datang" / coming soon) are untouched —
// that's a different state from "locked", not something payment unlocks.

import { hasPaidAccess } from '$lib/access';
import { FREE_VIDEO_LIMIT } from '$lib/config';
import rawSections from '$lib/sidebar-data.json';

export async function load({ locals }) {
	const paid = locals.user ? await hasPaidAccess(locals.user.id) : false;

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

			// Locked — strip the real video URL entirely. Only label survives.
			return { label: item.label, video: null, locked: true };
		})
	}));

	return { sections, hasPaid: paid };
}