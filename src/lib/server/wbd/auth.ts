import { error } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import type { WbdUser } from '$lib/wbd/types';

const COOKIE = 'wbd_user';

export function getSessionUser(cookies: Cookies): WbdUser | null {
	const raw = cookies.get(COOKIE);
	return raw ? (JSON.parse(raw) as WbdUser) : null;
}

export function requireRole(cookies: Cookies, roles: WbdUser['role'][]): WbdUser {
	const user = getSessionUser(cookies);
	if (!user) error(401, 'Sign-in required');
	if (!roles.includes(user.role)) error(403, 'Forbidden');
	return user;
}
