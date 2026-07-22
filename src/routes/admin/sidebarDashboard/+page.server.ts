// src/routes/admin/sidebar/+page.server.ts
//
// Matches your actual hooks.server.ts (locals.safeGetSession() / locals.supabase)
// and supabaseAdmin.ts (service-role client using the new secret-key format).
//
// One thing worth knowing: hooks.server.ts already redirects any logged-out
// visitor to /login for every route not in `publicRoutes` — so `/admin/sidebar`
// is already login-gated for free. This load function only needs to add the
// is_admin check on top of that, not re-implement the login redirect.

import { error,  fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { parseSidebarText } from '$lib/sidebarParser';
import { supabaseAdmin } from '$lib/supabaseAdmin';

export const load: PageServerLoad = async ({ locals }) => {
	// locals.user is already populated by hooks.server.ts, and hooks.server.ts
	// has already redirected to /login if it's null — but we re-check safely
	// in case this route ever gets added to publicRoutes by accident.
	const { user } = await locals.safeGetSession();

	if (!user) {
		error(401, 'Not authenticated');
	}

	const { data: profile, error: profileErr } = await locals.supabase
		.from('profiles')
		.select('is_admin')
		.eq('id', user.id)
		.single();

	if (profileErr || !profile?.is_admin) {
		error(403, 'Not authorized');
	}

	const { data: current } = await supabaseAdmin
		.from('sidebar_content')
		.select('version, updated_at')
		.eq('id', 'v1')
		.single();

	return {
		currentVersion: current?.version ?? null,
		currentUpdatedAt: current?.updated_at ?? null
	};
};

export const actions: Actions = {
	// Runs the parser only — does NOT touch the database. Lets the admin
	// eyeball the result before committing to anything.
	parse: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { message: 'Not authenticated' });

		const formData = await request.formData();
		const rawText = formData.get('rawText');

		if (typeof rawText !== 'string' || rawText.trim().length === 0) {
			return fail(400, { message: 'Paste the exported doc text first.' });
		}

		try {
			const result = parseSidebarText(rawText);
			return { parsed: result, rawText };
		} catch (e) {
			console.error('Sidebar parse failed:', e);
			return fail(500, { message: 'Parsing failed — check the console/logs.' });
		}
	},

	// Takes the already-parsed JSON (submitted back as a hidden field so we
	// don't re-parse and risk a different result than what was previewed)
	// and pushes it to Supabase, backing up the previous version first.
	push: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { message: 'Not authenticated' });

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single();

		if (!profile?.is_admin) {
			return fail(403, { message: 'Not authorized' });
		}

		const formData = await request.formData();
		const sectionsJson = formData.get('sectionsJson');

		if (typeof sectionsJson !== 'string') {
			return fail(400, { message: 'Missing parsed content — parse again before pushing.' });
		}

		let sections;
		try {
			sections = JSON.parse(sectionsJson);
		} catch {
			return fail(400, { message: 'Parsed content was corrupted — parse again.' });
		}

		// 1. Read current row so we can back it up before overwriting.
		const { data: existing, error: readErr } = await supabaseAdmin
			.from('sidebar_content')
			.select('content, version')
			.eq('id', 'v1')
			.single();

		if (readErr) {
			console.error('Failed to read current sidebar_content:', readErr);
			return fail(500, { message: 'Could not read current content before backing it up.' });
		}

		// 2. Stash the outgoing version into history — this is your "git revert".
		const { error: historyErr } = await supabaseAdmin.from('sidebar_content_history').insert({
			content: existing.content,
			version: existing.version,
			created_by: user.id
		});

		if (historyErr) {
			console.error('Failed to write sidebar_content_history:', historyErr);
			return fail(500, { message: 'Could not back up current content — push aborted.' });
		}

		// 3. Upsert the new content, bumping the version.
		const { error: upsertErr } = await supabaseAdmin
			.from('sidebar_content')
			.update({
				content: sections,
				version: existing.version + 1,
				updated_at: new Date().toISOString()
			})
			.eq('id', 'v1');

		if (upsertErr) {
			console.error('Failed to upsert sidebar_content:', upsertErr);
			return fail(500, { message: 'Backup succeeded but the push itself failed. Nothing live was changed.' });
		}

		return { pushed: true, newVersion: existing.version + 1 };
	}
};