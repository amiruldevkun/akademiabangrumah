// src/routes/+page.server.js
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

import { getSectionsWithAccess } from '$lib/sections';
import  { redirect } from '@sveltejs/kit';

const YOUTUBE_ID_PATTERN = /embed\/([A-Za-z0-9_-]+)/;

export async function load({ locals, cookies }) {
	if (!locals.user) {
		return { continueLesson: null };
	}

	const { sections } = await getSectionsWithAccess(locals.user.id);

	// Flatten to playable, unlocked items, remembering which section (=
	// "Modul N") each one belongs to.
	const accessibleItems = [];
	sections.forEach((section, sectionIndex) => {
		for (const item of section.items) {
			if (!item.locked && item.video) {
				accessibleItems.push({ ...item, moduleNumber: sectionIndex + 1 });
			}
		}
	});

	if (accessibleItems.length === 0) {
		return { continueLesson: null };
	}

	const { data: rows, error } = await locals.supabase
		.from('video_progress')
		.select('item_id, resume_seconds, duration_seconds, updated_at')
		.eq('user_id', locals.user.id)
		.eq('watched', false)
		.order('updated_at', { ascending: false })
		.limit(1);

	if (error) {
		console.error('Failed to load continue-learning progress:', error);
	}

	let continueItem = null;
	let progress = null;

	const inProgressRow = rows?.[0];
	if (inProgressRow) {
		// The most recent in-progress row might point at an item that's since
		// been relocked (paid status changed) or removed from the doc — if so,
		// fall through to the "start here" default below instead of showing
		// a dead lesson.
		continueItem = accessibleItems.find((item) => item.id === inProgressRow.item_id) ?? null;
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

	const youTubeId = continueItem.video.match(YOUTUBE_ID_PATTERN)?.[1] ?? null;

	const justPaid = cookies.get('just_paid') === 'true';
    
    if (justPaid) {
        // Delete it right away so a page refresh clears the element
        cookies.delete('just_paid', { path: '/' });
    }


	return {
		showElement: justPaid,
		continueLesson: {
			id: continueItem.id,
			moduleNumber: continueItem.moduleNumber,
			title: continueItem.label,
			progressPercent,
			durationLabel: formatDuration(durationSeconds),
			// No thumbnail API exists for Drive's /preview iframe (same
			// limitation as duration/resume) — the component falls back to a
			// generic icon when this is null.
			thumbnail: youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : null
		}
	};
}

function formatDuration(totalSeconds) {
	if (!totalSeconds) return null;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}