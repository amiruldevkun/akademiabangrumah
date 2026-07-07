// src/routes/+layout.server.js
import { redirect } from '@sveltejs/kit';
import { hasPaidAccess } from '$lib/access.js';

export async function load({ locals }) {
  return {
    session: locals.session
  };
  
  const paid = await hasPaidAccess(locals.user.id);
	if (!paid) {
		throw redirect(303, '/'); // back to the payment landing page
	}
 
	return {};
}