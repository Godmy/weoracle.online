import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerEmail } from '$lib/server/class/manager/email';
import { ManagerApplication } from '$lib/server/class/manager/application';

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
			await ManagerEmail.send(env.RESEND_API_KEY, {
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
		await ManagerApplication.create(db, { requestType, name, email, company, message, emailSent });
	}

	redirect(303, `/application?submitted=1&type=${encodeURIComponent(requestType)}`);
};
