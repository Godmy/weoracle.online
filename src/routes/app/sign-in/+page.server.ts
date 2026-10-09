import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { constantTimeEqualStrings } from '$lib/server/function/crypto/constant-time-equal-strings';
import { generateId } from '$lib/server/function/generate/id';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';
import type { WbdUser } from '$lib/server/interface/db/user';

// Structural subset of the real (ambient, unimported) KVNamespace type — see the note in
// src/lib/server/wbd/db.ts about why bindings are accessed without importing global Workers types.
interface KVLike {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<unknown>;
	delete(key: string): Promise<unknown>;
}

const COOKIE = 'wbd_user';
const ADMIN_LOGIN_MAX_ATTEMPTS = 5;
const ADMIN_LOGIN_LOCKOUT_SECONDS = 15 * 60;

export const load: PageServerLoad = ({ cookies, url }) => {
	if (cookies.get(COOKIE)) {
		redirect(303, url.searchParams.get('next') || '/app');
	}
	return {};
};

export const actions: Actions = {
	adminSignIn: async ({ request, url, platform, cookies, getClientAddress }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(form.get('password') ?? '');
		const env = platform!.env as {
			ADMIN_EMAIL?: string;
			ADMIN_PASSWORD?: string;
			KV: KVLike;
			DB: {
				prepare(query: string): {
					bind(...values: unknown[]): {
						first<T = unknown>(): Promise<T | null>;
					};
				};
			};
		};

		const rateLimitKey = `admin-signin-fail:${getClientAddress()}`;
		const failCount = Number((await env.KV.get(rateLimitKey)) ?? '0');
		if (failCount >= ADMIN_LOGIN_MAX_ATTEMPTS) {
			return fail(429, { message: 'Too many attempts — try again later' });
		}

		const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
		const adminPassword = env.ADMIN_PASSWORD;

		if (!adminEmail || !adminPassword) {
			return fail(500, { message: 'Admin sign-in is not configured' });
		}

		const [emailMatches, passwordMatches] = await Promise.all([
			constantTimeEqualStrings(email, adminEmail),
			constantTimeEqualStrings(password, adminPassword)
		]);
		if (!emailMatches || !passwordMatches) {
			await env.KV.put(rateLimitKey, String(failCount + 1), {
				expirationTtl: ADMIN_LOGIN_LOCKOUT_SECONDS
			});
			return fail(401, { message: 'Invalid admin credentials' });
		}
		await env.KV.delete(rateLimitKey);

		try {
			const user = await env.DB.prepare(
				`INSERT INTO wbd_users (id, email, name, company, role)
				 VALUES (?1, ?2, ?3, NULL, 'admin')
				 ON CONFLICT(email) DO UPDATE SET name = excluded.name, role = 'admin'
				 RETURNING *`
			)
				.bind(generateId(), adminEmail, 'Administrator')
				.first<WbdUser>();
			if (!user) {
				return fail(500, { message: 'Could not sign in as admin' });
			}

			cookies.set(COOKIE, JSON.stringify(user), {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30
			});
		} catch (err) {
			const { status, message } = mapD1Error(err);
			return fail(status, { message });
		}

		redirect(303, url.searchParams.get('next') || '/app');
	},

	signOut: ({ cookies }) => {
		cookies.delete(COOKIE, { path: '/' });
		redirect(303, '/');
	}
};
