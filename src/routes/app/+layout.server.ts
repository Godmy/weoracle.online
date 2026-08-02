import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { WbdUser } from '$lib/wbd/types';

const COOKIE = 'wbd_user';

export const load: LayoutServerLoad = ({ cookies, url }) => {
	const raw = cookies.get(COOKIE);
	const user = raw ? (JSON.parse(raw) as WbdUser) : null;

	if (!user && url.pathname !== '/app/sign-in') {
		redirect(303, `/app/sign-in?next=${encodeURIComponent(url.pathname)}`);
	}

	return { user };
};
