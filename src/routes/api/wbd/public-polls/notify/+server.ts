import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerEmail } from '$lib/server/class/manager/email';

const FROM = { email: 'login@weoracle.online', name: 'WeOracle' };
const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

export const POST: RequestHandler = async ({ request, platform }) => {
	const form = await request.formData();
	const pollId = String(form.get('pollId') ?? '').trim();
	const email = String(form.get('email') ?? '').trim();

	if (!pollId || !email) {
		error(400, 'pollId and email are required');
	}

	const env = platform!.env as {
		RESEND_API_KEY?: string;
		CONTACT_EMAIL?: string;
		ADMIN_EMAIL?: string;
	};
	const recipient = env.CONTACT_EMAIL ?? env.ADMIN_EMAIL;

	if (env.RESEND_API_KEY && recipient) {
		await ManagerEmail.send(env.RESEND_API_KEY, {
			to: recipient,
			from: FROM,
			subject: 'Public poll notification request',
			html: `<p>Public poll notification request</p><p>Poll: ${escapeHtml(pollId)}</p><p>Email: ${escapeHtml(email)}</p>`,
			text: `Public poll notification request\n\nPoll: ${pollId}\nEmail: ${email}`
		});
	}

	redirect(303, '/?submitted=poll-notification#public-polls');
};
