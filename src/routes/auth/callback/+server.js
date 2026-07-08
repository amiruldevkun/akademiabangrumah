// src/routes/auth/callback/+server.js
import { redirect } from '@sveltejs/kit';
import { hasPaidAccess } from '$lib/access';

export async function GET({ url, locals }) {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');
	const errorDescription = url.searchParams.get('error_description');

	// User cancelled, denied access, or Google returned some other error
	if (error) {
		console.warn('OAuth error:', error, errorDescription);
		throw redirect(303, `/login?error=${encodeURIComponent(errorDescription || error)}`);
	}

	if (code) {
		const {
			data: { session },
			error: exchangeError
		} = await locals.supabase.auth.exchangeCodeForSession(code);

		if (exchangeError) {
			console.error('Session exchange failed:', exchangeError.message);
			throw redirect(303, `/login?error=${encodeURIComponent(exchangeError.message)}`);
		}

		if (!session?.user) {
			// No error, but also no session — happens with a stale/already-used
			// code (e.g. back/forward button replay). Safest is back to login.
			console.warn('Exchange succeeded with no error, but session/user was null');
			throw redirect(303, '/login');
		}

		// Put as a placeholder and redirect to main menu
		// throw redirect(303, '/main_menu');

		const paid = await hasPaidAccess(session.user.id);
		throw redirect(303, paid ? '/main_menu' : '/pay_landing');
	}

	// Neither a code nor an error param — something unexpected, safest to send back to login
	throw redirect(303, '/login');
}