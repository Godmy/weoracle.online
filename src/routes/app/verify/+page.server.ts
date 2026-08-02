import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { consumeMagicLinkToken } from '$lib/server/wbd/magic-link';
import type { WbdUser } from '$lib/wbd/types';

const COOKIE = 'wbd_user';

export const load: PageServerLoad = async ({ url, platform, cookies, fetch }) => {
	const token = url.searchParams.get('token');
	if (!token) error(400, 'Missing token');

	const payload = await consumeMagicLinkToken(platform!.env.KV, token);
	if (!payload) error(400, 'This sign-in link is invalid or has expired. Request a new one.');

	const res = await fetch('/api/wbd/users', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ email: payload.email, name: payload.name, role: 'coordinator' })
	});
	if (!res.ok) error(res.status, 'Could not sign in');
	const user = (await res.json()) as WbdUser;

	cookies.set(COOKIE, JSON.stringify(user), { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
	redirect(303, url.searchParams.get('next') || '/app');
};
