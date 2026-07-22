// src/routes/+page.server.js
export async function load({ locals }) {
	const { user } = await locals.safeGetSession();

	return {
		userEmail: user?.email ?? null,
		suggestedName: user?.user_metadata?.full_name ?? ''
	};
}