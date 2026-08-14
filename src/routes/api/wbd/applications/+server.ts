import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendEmailViaResend } from '$lib/server/wbd/resend';
import { generateId, mapD1Error } from '$lib/server/wbd/db';

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
	const requestType = String(form.get('requestType') ?? '').trim();
	const name = String(form.get('name') ?? '').trim();
	const email = String(form.get('email') ?? '').trim();
	const company = String(form.get('company') ?? '').trim();
	const message = String(form.get('message') ?? '').trim();

	if (!requestType || !name || !email || !message) {
		error(400, 'requestType, name, email, and message are required');
	}

	const env = platform?.env as
		| {
		RESEND_API_KEY?: string;
		CONTACT_EMAIL?: string;
		ADMIN_EMAIL?: string;
	}
		| undefined;
	const recipient = env?.CONTACT_EMAIL ?? env?.ADMIN_EMAIL;

	let emailSent = false;
	if (env?.RESEND_API_KEY && recipient) {
		try {
			await sendEmailViaResend(env.RESEND_API_KEY, {
				to: recipient,
				from: FROM,
				subject: `WeOracle application: ${requestType}`,
				html: `<p>WeOracle application</p><p>Type: ${escapeHtml(requestType)}</p><p>Name: ${escapeHtml(name)}</p><p>Email: ${escapeHtml(email)}</p><p>Company: ${escapeHtml(company)}</p><p>${escapeHtml(message)}</p>`,
				text: `WeOracle application\n\nType: ${requestType}\nName: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`
			});
			emailSent = true;
		} catch (err) {
			// The application still gets saved below even if the notification email fails —
			// don't lose the submission over a transient Resend/network error.
			console.error('sendEmailViaResend failed:', err);
		}
	}

	const db = platform?.env?.DB;
	if (db) {
		try {
			await db
				.prepare(
					`INSERT INTO wbd_applications (id, request_type, name, email, company, message, email_sent)
					 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
				)
				.bind(generateId(), requestType, name, email, company || null, message, emailSent ? 1 : 0)
				.run();
		} catch (err) {
			const { status, message: dbMessage } = mapD1Error(err);
			error(status, dbMessage);
		}
	}

	redirect(303, `/application?submitted=1&type=${encodeURIComponent(requestType)}`);
};
