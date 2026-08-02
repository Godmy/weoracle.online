import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { WbdUser } from '$lib/wbd/types';

const COOKIE = 'wbd_user';

export const load: PageServerLoad = ({ cookies, url }) => {
	if (cookies.get(COOKIE)) {
		redirect(303, url.searchParams.get('next') || '/app');
	}
	return {};
};

export const actions: Actions = {
	signIn: async ({ request, fetch, cookies, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const name = String(form.get('name') ?? '').trim();
		if (!email || !name) {
			return fail(400, { message: 'Email and name are required' });
		}

		const res = await fetch('/api/wbd/users', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, name, role: 'coordinator' })
		});
		if (!res.ok) {
			return fail(res.status, { message: 'Could not sign in' });
		}
		const user = (await res.json()) as WbdUser;

		cookies.set(COOKIE, JSON.stringify(user), { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
		redirect(303, url.searchParams.get('next') || '/app');
	},

	signOut: ({ cookies }) => {
		cookies.delete(COOKIE, { path: '/' });
		redirect(303, '/app/sign-in');
	}
};
