import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error } from '$lib/server/wbd/db';
import { recordAuditEvent } from '$lib/server/wbd/audit';

export const POST: RequestHandler = async ({ request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.title !== 'string' || typeof body.created_by !== 'string') {
		error(400, 'title and created_by are required');
	}
	const { title, description, max_rounds, assumptions, created_by } = body as {
		title: string;
		description?: string;
		max_rounds?: number;
		assumptions?: string;
		created_by: string;
	};

	const db = platform!.env.DB;
	try {
		const result = await db
			.prepare(
				`INSERT INTO wbd_sessions (id, title, description, max_rounds, assumptions, created_by)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6)
				 RETURNING *`
			)
			.bind(generateId(), title, description ?? null, max_rounds ?? 3, assumptions ?? null, created_by)
			.first<{ id: string }>();

		await recordAuditEvent(db, {
			actorUserId: created_by,
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

export const GET: RequestHandler = async ({ url, platform }) => {
	const createdBy = url.searchParams.get('created_by');
	const db = platform!.env.DB;
	const stmt = createdBy
		? db.prepare(`${LIST_SQL} WHERE s.created_by = ?1 ORDER BY s.created_at DESC`).bind(createdBy)
		: db.prepare(`${LIST_SQL} ORDER BY s.created_at DESC`);
	const { results } = await stmt.all();
	return json(results);
};
