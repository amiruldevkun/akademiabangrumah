// src/routes/auth/callback/+server.js
import { redirect } from '@sveltejs/kit';
import { hasPaidAccess } from '$lib/access.js';

export async function GET({ url, locals }) {
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // If user accidentally went back to google acc selector, redirect to /
  if (code) {
    const {data : {session}} = await locals.supabase.auth.getSession();
    if (session) {
      throw redirect(303, '/')
    }
  }
  // User cancelled, denied access, or Google returned some other error
  if (error) {
    console.warn('OAuth error:', error, errorDescription);
    throw redirect(303, `/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    const { error: exchangeError } = await locals.supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Session exchange failed:', exchangeError.message);
      throw redirect(303, `/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    // Only reach here if we actually have a valid session now
    const paid = await hasPaidAccess(session.user.id);
    throw redirect(303, paid ? '/' : '/pay_landing');
  }

  // Neither a code nor an error param — something unexpected, safest to send back to login
  throw redirect(303, '/login');
}