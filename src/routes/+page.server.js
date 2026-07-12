import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async({cookies}) => {
		cookies.set('just_paid', 'true' ,{ path: '/', max_age: 15});
		throw redirect(303, '/main_menu')
	}
}