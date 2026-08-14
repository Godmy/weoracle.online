import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { consumeMagicLinkToken } from '$lib/server/wbd/magic-link';
import { createSessionExpert, publicExpertCookieName } from '$lib/server/wbd/experts';
import { recordAuditEvent } from '$lib/server/wbd/audit';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
	const token = url.searchParams.get('token');
	if (!token) error(400, 'Missing token');

	const payload = await consumeMagicLinkToken(platform!.env.KV, token);
	if (!payload || !payload.sessionId) error(400, 'This link is invalid or has expired. Request a new one.');

	const db = platform!.env.DB;
	const session = await db
		.prepare(`SELECT id FROM wbd_sessions WHERE id = ?1 AND is_public = 1`)
		.bind(payload.sessionId)
		.first<{ id: string }>();
	if (!session) error(404, 'This poll is not public or does not exist');

	const expert = await createSessionExpert(db, payload.sessionId, { email: payload.email, name: payload.name });
	if (!expert) error(500, 'Could not join this poll');

	await recordAuditEvent(db, {
		actorUserId: null,
		sessionId: payload.sessionId,
		action: 'expert_self_joined',
		entityType: 'session_expert',
		entityId: expert.id,
		metadata: { email: payload.email }
	});

	cookies.set(publicExpertCookieName(payload.sessionId), expert.token, {
		path: '/public',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});

	redirect(303, `/public/band/${payload.sessionId}`);
};
