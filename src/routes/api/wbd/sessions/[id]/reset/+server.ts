import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mapD1Error } from '$lib/server/wbd/db';
import { recordAuditEvent } from '$lib/server/wbd/audit';
import { requireSessionOwner } from '$lib/server/wbd/auth';
import { deleteSessionProgressData } from '$lib/server/wbd/session-cleanup';

export const POST: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await requireSessionOwner(cookies, db, params.id);

	const existing = await db.prepare(`SELECT id FROM wbd_sessions WHERE id = ?1`).bind(params.id).first();
	if (!existing) error(404, 'Session not found');

	try {
		await deleteSessionProgressData(db, params.id);
		const session = await db
			.prepare(
				`UPDATE wbd_sessions
				 SET status = 'draft',
				     current_round = 0,
				     started_at = NULL,
				     completed_at = NULL
				 WHERE id = ?1
				 RETURNING *`
			)
			.bind(params.id)
			.first();

		await recordAuditEvent(db, {
			actorUserId: actor.id,
			sessionId: params.id,
			action: 'session_reset',
			entityType: 'session',
			entityId: params.id
		});

		return json(session);
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};
