// Direct Resend HTTP API client — Cloudflare's own Email Sending binding requires every
// recipient to be a manually pre-verified "destination address" (same model as Email Routing),
// which makes it unusable for sending to arbitrary end users (magic-link sign-in, expert
// invites). Resend only requires the *sending* domain to be verified once; any recipient works.
export interface SendEmailInput {
	to: string;
	from: { email: string; name?: string };
	subject: string;
	html: string;
	text: string;
}

export async function sendEmailViaResend(apiKey: string, input: SendEmailInput): Promise<void> {
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			authorization: `Bearer ${apiKey}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			from: input.from.name ? `${input.from.name} <${input.from.email}>` : input.from.email,
			to: [input.to],
			subject: input.subject,
			html: input.html,
			text: input.text
		})
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Resend send failed (${res.status}): ${body}`);
	}
}
