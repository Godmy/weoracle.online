import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error, nowIso } from '$lib/server/wbd/db';

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const round = url.searchParams.get('round');
	if (!round) error(400, 'round query param is required');

	const db = platform!.env.DB;
	const { results } = await db
		.prepare(`SELECT * FROM wbd_answers WHERE question_id = ?1 AND round_number = ?2`)
		.bind(params.id, round)
		.all();
	return json(results);
};

/** Submits or updates one expert's answer for a question in a given round. */
export const POST: RequestHandler = async ({ params, request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.round_number !== 'number' || typeof body.expert_token !== 'string') {
		error(400, 'round_number and expert_token are required');
	}
	const { round_number, expert_token, optimistic, realistic, pessimistic, rationale, confidence } = body as {
		round_number: number;
		expert_token: string;
		optimistic?: number;
		realistic?: number;
		pessimistic?: number;
		rationale?: string;
		confidence?: number;
	};

	const db = platform!.env.DB;

	// Verify the expert token actually belongs to the session that owns this question.
	const membership = await db
		.prepare(
			`SELECT 1 FROM wbd_session_experts se
			 JOIN wbd_questions q ON q.session_id = se.session_id
			 WHERE se.token = ?1 AND q.id = ?2`
		)
		.bind(expert_token, params.id)
		.first();
	if (!membership) error(403, 'Token is not an expert on this question’s session');

	try {
		const now = nowIso();
		const result = await db
			.prepare(
				`INSERT INTO wbd_answers
				 (id, question_id, round_number, expert_token, optimistic, realistic, pessimistic, rationale, confidence, submitted_at, updated_at)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
				 ON CONFLICT(question_id, round_number, expert_token) DO UPDATE SET
				   optimistic = excluded.optimistic,
				   realistic = excluded.realistic,
				   pessimistic = excluded.pessimistic,
				   rationale = excluded.rationale,
				   confidence = excluded.confidence,
				   updated_at = excluded.updated_at
				 RETURNING *`
			)
			.bind(
				generateId(),
				params.id,
				round_number,
				expert_token,
				optimistic ?? null,
				realistic ?? null,
				pessimistic ?? null,
				rationale ?? null,
				confidence ?? null,
				now
			)
			.first();
		return json(result, { status: 201 });
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};
