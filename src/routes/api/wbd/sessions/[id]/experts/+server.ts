import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EXPERTS_BY_SESSION_SQL, mapD1Error } from '$lib/server/wbd/db';
import { requireSessionOwner } from '$lib/server/wbd/auth';
import { recordAuditEvent } from '$lib/server/wbd/audit';
import { createSessionExpert } from '$lib/server/wbd/experts';

export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await requireSessionOwner(cookies, db, params.id);

	const { results } = await db.prepare(EXPERTS_BY_SESSION_SQL).bind(params.id).all();
	return json(results);
};

/** Invites an expert: get-or-creates their user record, then adds them to the session with a fresh invite token. */
export const POST: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.email !== 'string' || !body.email.trim()) {
		error(400, 'email is required');
	}
	const { email, name, company, alias } = body as {
		email: string;
		name?: string;
		company?: string;
		alias?: string;
	};

	try {
		const result = await createSessionExpert(db, params.id, { email, name, company, alias });

		await recordAuditEvent(db, {
			actorUserId: actor.id,
			sessionId: params.id,
			action: 'expert_invited',
			entityType: 'session_expert',
			entityId: result!.id,
			metadata: { email }
		});

		return json(result, { status: 201 });
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};
