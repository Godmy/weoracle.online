import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EXPERTS_BY_SESSION_SQL, generateId, generateToken, mapD1Error } from '$lib/server/wbd/db';
import { getSessionUser } from '$lib/server/wbd/auth';
import { recordAuditEvent } from '$lib/server/wbd/audit';

export const GET: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const { results } = await db.prepare(EXPERTS_BY_SESSION_SQL).bind(params.id).all();
	return json(results);
};

/** Invites an expert: get-or-creates their user record, then adds them to the session with a fresh invite token. */
export const POST: RequestHandler = async ({ params, request, cookies, platform }) => {
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

	const db = platform!.env.DB;
	try {
		const user = await db
			.prepare(
				`INSERT INTO wbd_users (id, email, name, company, role)
				 VALUES (?1, ?2, ?3, ?4, 'expert')
				 ON CONFLICT(email) DO UPDATE SET name = excluded.name, company = excluded.company
				 RETURNING *`
			)
			.bind(generateId(), email, name?.trim() || email.split('@')[0], company ?? null)
			.first<{ id: string }>();

		const existingCount = await db
			.prepare(`SELECT COUNT(*) AS n FROM wbd_session_experts WHERE session_id = ?1`)
			.bind(params.id)
			.first<{ n: number }>();

		const result = await db
			.prepare(
				`INSERT INTO wbd_session_experts (id, session_id, user_id, token, alias)
				 VALUES (?1, ?2, ?3, ?4, ?5)
				 RETURNING *`
			)
			.bind(generateId(), params.id, user!.id, generateToken(), alias?.trim() || `Expert ${(existingCount?.n ?? 0) + 1}`)
			.first<{ id: string }>();

		const actor = getSessionUser(cookies);
		await recordAuditEvent(db, {
			actorUserId: actor?.id ?? null,
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
