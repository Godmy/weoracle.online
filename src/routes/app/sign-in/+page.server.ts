import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { constantTimeEqualStrings } from '$lib/server/wbd/crypto';
import { generateId, mapD1Error } from '$lib/server/wbd/db';
import { createMagicLinkToken, magicLinkEmailHtml, magicLinkEmailText } from '$lib/server/wbd/magic-link';
import { sendEmailViaResend } from '$lib/server/wbd/resend';
import type { WbdUser } from '$lib/wbd/types';

// Structural subset of the real (ambient, unimported) KVNamespace type — see the note in
// src/lib/server/wbd/db.ts about why bindings are accessed without importing global Workers types.
interface KVLike {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<unknown>;
	delete(key: string): Promise<unknown>;
}

const COOKIE = 'wbd_user';
const FROM = { email: 'login@weoracle.online', name: 'WeOracle' };
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
		const email = String(form.get('email') ?? '').trim().toLowerCase();
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
			await env.KV.put(rateLimitKey, String(failCount + 1), { expirationTtl: ADMIN_LOGIN_LOCKOUT_SECONDS });
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

	requestLink: async ({ request, url, platform }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const name = String(form.get('name') ?? '').trim();
		if (!email || !name) {
			return fail(400, { message: 'Email and name are required' });
		}

		const token = await createMagicLinkToken(platform!.env.KV, { email, name });
		const link = `${url.origin}/app/verify?token=${token}${url.searchParams.get('next') ? `&next=${encodeURIComponent(url.searchParams.get('next')!)}` : ''}`;

		const apiKey = platform!.env.RESEND_API_KEY;
		if (!apiKey) error(500, 'Email sending is not configured');
		try {
			await sendEmailViaResend(apiKey, {
				to: email,
				from: FROM,
				subject: 'Sign in to WeOracle',
				html: magicLinkEmailHtml(link),
				text: magicLinkEmailText(link)
			});
		} catch (err) {
			// Surface the real Resend error in `wrangler tail` — the message returned to the
			// client is intentionally generic, but the cause (e.g. unverified sending domain)
			// should be visible in logs without re-deriving it via a side-channel request.
			console.error('sendEmailViaResend failed:', err);
			return fail(502, { message: 'Could not send the sign-in email — please try again' });
		}

		return { sent: true, email };
	},

	signOut: ({ cookies }) => {
		cookies.delete(COOKIE, { path: '/' });
		redirect(303, '/');
	}
};
