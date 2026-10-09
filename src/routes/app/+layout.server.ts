import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';

export const load: LayoutServerLoad = ({ cookies, url }) => {
	const user = ManagerAuth.getSessionUser(cookies);

	if (
		!user &&
		url.pathname !== '/app/sign-in' &&
		url.pathname !== '/app/magic-link' &&
		url.pathname !== '/app/verify'
	) {
		redirect(303, `/app/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}

	return { user };
};
