import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createMagicLinkToken, magicLinkEmailHtml, magicLinkEmailText } from '$lib/server/wbd/magic-link';
import { sendEmailViaResend } from '$lib/server/wbd/resend';

const COOKIE = 'wbd_user';
const FROM = { email: 'login@weoracle.online', name: 'WeOracle' };

export const load: PageServerLoad = ({ cookies, url }) => {
	if (cookies.get(COOKIE)) {
		redirect(303, url.searchParams.get('next') || '/app');
	}
	return {};
};

export const actions: Actions = {
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
		} catch {
			return fail(502, { message: 'Could not send the sign-in email — please try again' });
		}

		return { sent: true, email };
	},

	signOut: ({ cookies }) => {
		cookies.delete(COOKIE, { path: '/' });
		redirect(303, '/app/sign-in');
	}
};
