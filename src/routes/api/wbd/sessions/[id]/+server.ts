import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mapD1Error, nowIso } from '$lib/server/wbd/db';

const STATUSES = ['draft', 'active', 'round_1', 'round_2', 'round_3', 'completed'] as const;
const PATCHABLE_COLUMNS = new Set(['status', 'current_round', 'assumptions', 'started_at', 'completed_at']);

export const GET: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const session = await db.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`).bind(params.id).first();
	if (!session) error(404, 'Session not found');

	const [{ results: questions }, { results: experts }] = await Promise.all([
		db
			.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
			.bind(params.id)
			.all(),
		db
			.prepare(
				`SELECT id, user_id, token, alias, invited_at, joined_at FROM wbd_session_experts WHERE session_id = ?1 ORDER BY invited_at`
			)
			.bind(params.id)
			.all()
	]);

	return json({ ...session, questions, experts });
};

export const PATCH: RequestHandler = async ({ params, request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') error(400, 'Invalid body');

	if ('status' in body && !STATUSES.includes(body.status)) {
		error(400, `status must be one of ${STATUSES.join(', ')}`);
	}

	const entries = Object.entries(body as Record<string, unknown>).filter(([key]) =>
		PATCHABLE_COLUMNS.has(key)
	);
	if (entries.length === 0) error(400, `No patchable fields provided (${[...PATCHABLE_COLUMNS].join(', ')})`);

	const setClause = entries.map(([key], i) => `${key} = ?${i + 1}`).join(', ');
	const values = entries.map(([, value]) => value);

	const db = platform!.env.DB;
	try {
		const result = await db
			.prepare(`UPDATE wbd_sessions SET ${setClause} WHERE id = ?${entries.length + 1} RETURNING *`)
			.bind(...values, params.id)
			.first();
		if (!result) error(404, 'Session not found');
		return json(result);
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};

// Convenience: advance a session into the next round, or mark completed once max_rounds is reached.
export const POST: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const session = await db
		.prepare(`SELECT current_round, max_rounds FROM wbd_sessions WHERE id = ?1`)
		.bind(params.id)
		.first<{ current_round: number; max_rounds: number }>();
	if (!session) error(404, 'Session not found');

	const nextRound = session.current_round + 1;
	const completed = nextRound > session.max_rounds;
	// The status enum only names round_1..round_3 explicitly (the common case); sessions
	// configured with more rounds stay 'active' once past that, current_round stays authoritative.
	const status = completed ? 'completed' : nextRound <= 3 ? `round_${nextRound}` : 'active';
	const result = await db
		.prepare(
			`UPDATE wbd_sessions
			 SET current_round = ?1,
			     status = ?2,
			     started_at = COALESCE(started_at, ?3),
			     completed_at = ?4
			 WHERE id = ?5
			 RETURNING *`
		)
		.bind(completed ? session.max_rounds : nextRound, status, nowIso(), completed ? nowIso() : null, params.id)
		.first();
	return json(result);
};
