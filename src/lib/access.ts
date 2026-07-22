// src/lib/server/access.ts
//
// Call this from any +page.server.js / +layout.server.js that guards
// paid content. Reads the single `has_paid` flag that the ToyyibPay
// callback flips — this is what makes access persist across re-logins
// and devices, since it's stored in Supabase, not client-side.

import { supabaseAdmin } from '$lib/supabaseAdmin';

/**
 * @param {string} userId
 * @returns {Promise<boolean>}
 */

export async function hasPaidAccess(userId:string): Promise<boolean> {
	if (!userId) return false;

	const { data, error } = await supabaseAdmin
		.from('profiles')
		.select('has_paid')
		.eq('id', userId)
		.single();

	if (error) {
		console.error('hasPaidAccess lookup failed:', error);
		return false; // fail closed
	}

	return data?.has_paid === true;
}