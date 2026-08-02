import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getSessionUser } from '$lib/server/wbd/auth';

export const load: LayoutServerLoad = ({ cookies, url }) => {
	const user = getSessionUser(cookies);

	if (!user && url.pathname !== '/app/sign-in' && url.pathname !== '/app/verify') {
		redirect(303, `/app/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}

	return { user };
};
