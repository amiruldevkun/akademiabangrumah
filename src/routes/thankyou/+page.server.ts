import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async({cookies}) => {
		cookies.set('just_paid', 'true' ,{ path: '/', maxAge: 15});
		throw redirect(303, '/main_menu')
	}
}