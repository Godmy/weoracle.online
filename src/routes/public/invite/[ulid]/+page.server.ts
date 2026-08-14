import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { publicExpertCookieName } from '$lib/server/wbd/experts';
import type { D1Like } from '$lib/server/wbd/db';
import { createMagicLinkToken, magicLinkEmailHtml, magicLinkEmailText } from '$lib/server/wbd/magic-link';
import { sendEmailViaResend } from '$lib/server/wbd/resend';

const FROM = { email: 'login@weoracle.online', name: 'WeOracle' };

interface PublicSessionRow {
	id: string;
	title: string;
	description: string | null;
	image_url: string | null;
	assumptions: string | null;
	status: string;
	current_round: number;
	max_rounds: number;
	question_count: number;
}

async function loadPublicSession(db: D1Like, ulid: string): Promise<PublicSessionRow> {
	const session = await db
		.prepare(
			`SELECT s.id, s.title, s.description, s.image_url, s.assumptions, s.status, s.current_round, s.max_rounds,
			        (SELECT COUNT(*) FROM wbd_questions q WHERE q.session_id = s.id) AS question_count
			 FROM wbd_sessions s
			 WHERE s.id = ?1 AND s.is_public = 1`
		)
		.bind(ulid)
		.first<PublicSessionRow>();
	if (!session) error(404, 'This poll is not public or does not exist');
	return session;
}

export const load: PageServerLoad = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const session = await loadPublicSession(db, params.ulid);

	if (cookies.get(publicExpertCookieName(params.ulid))) {
		redirect(303, `/public/band/${params.ulid}`);
	}

	return { session };
};

export const actions: Actions = {
	join: async ({ params, request, url, platform }) => {
		const db = platform!.env.DB;
		await loadPublicSession(db, params.ulid);

		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const name = String(form.get('name') ?? '').trim();
		if (!email || !name) {
			return fail(400, { message: 'Email and name are required' });
		}

		const token = await createMagicLinkToken(platform!.env.KV, { email, name, sessionId: params.ulid });
		const link = `${url.origin}/public/verify?token=${token}`;

		const apiKey = platform!.env.RESEND_API_KEY;
		if (!apiKey) error(500, 'Email sending is not configured');
		try {
			await sendEmailViaResend(apiKey, {
				to: email,
				from: FROM,
				subject: 'Your link to WeOracle',
				html: magicLinkEmailHtml(link),
				text: magicLinkEmailText(link)
			});
		} catch (err) {
			console.error('sendEmailViaResend failed:', err);
			return fail(502, { message: 'Could not send the sign-in email — please try again' });
		}

		return { sent: true, email };
	}
};
