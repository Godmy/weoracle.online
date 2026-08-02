import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error } from '$lib/server/wbd/db';
import { recordAuditEvent } from '$lib/server/wbd/audit';
import { requireRole } from '$lib/server/wbd/auth';

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
	const actor = requireRole(cookies, ['coordinator', 'admin']);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.title !== 'string') {
		error(400, 'title is required');
	}
	const { title, description, max_rounds, assumptions } = body as {
		title: string;
		description?: string;
		max_rounds?: number;
		assumptions?: string;
	};

	const db = platform!.env.DB;
	try {
		// created_by is always the signed-in actor, never a client-supplied value — otherwise
		// anyone could attribute a session to an arbitrary user id.
		const result = await db
			.prepare(
				`INSERT INTO wbd_sessions (id, title, description, max_rounds, assumptions, created_by)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6)
				 RETURNING *`
			)
			.bind(generateId(), title, description ?? null, max_rounds ?? 3, assumptions ?? null, actor.id)
			.first<{ id: string }>();

		await recordAuditEvent(db, {
			actorUserId: actor.id,
			sessionId: result!.id,
			action: 'session_created',
			entityType: 'session',
			entityId: result!.id,
			metadata: { title }
		});

		return json(result, { status: 201 });
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};

const LIST_SQL = `
	SELECT
		s.*,
		(SELECT COUNT(*) FROM wbd_session_experts se WHERE se.session_id = s.id) AS expert_count,
		(SELECT COUNT(*) FROM wbd_questions q WHERE q.session_id = s.id) AS question_count,
		(SELECT COUNT(*) FROM wbd_answers a
		   JOIN wbd_questions q ON q.id = a.question_id
		   WHERE q.session_id = s.id AND a.round_number = s.current_round) AS response_count
	FROM wbd_sessions s
`;

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const actor = requireRole(cookies, ['coordinator', 'admin']);
	const db = platform!.env.DB;

	// Coordinators only ever see their own sessions, regardless of what ?created_by= says.
	// Admins may pass ?created_by= to filter, or omit it to see every session.
	const createdBy = actor.role === 'admin' ? url.searchParams.get('created_by') : actor.id;
	const stmt = createdBy
		? db.prepare(`${LIST_SQL} WHERE s.created_by = ?1 ORDER BY s.created_at DESC`).bind(createdBy)
		: db.prepare(`${LIST_SQL} ORDER BY s.created_at DESC`);
	const { results } = await stmt.all();
	return json(results);
};
