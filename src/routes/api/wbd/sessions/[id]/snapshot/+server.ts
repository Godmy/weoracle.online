import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId } from '$lib/server/wbd/db';
import { computeRoundStats } from '$lib/server/wbd/stats';
import { requireSessionOwner } from '$lib/server/wbd/auth';

export const GET: RequestHandler = async ({ params, url, cookies, platform }) => {
	const round = url.searchParams.get('round');
	if (!round) error(400, 'round query param is required');

	const db = platform!.env.DB;
	await requireSessionOwner(cookies, db, params.id);

	const { results } = await db
		.prepare(`SELECT * FROM wbd_round_snapshots WHERE session_id = ?1 AND round_number = ?2`)
		.bind(params.id, round)
		.all();
	return json(results);
};

/** Computes median/quartile/consensus stats for every question in the session for one round, and stores them. */
export const POST: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	await requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.round_number !== 'number') {
		error(400, 'round_number is required');
	}
	const { round_number } = body as { round_number: number };

	const { results: questions } = await db
		.prepare(`SELECT id FROM wbd_questions WHERE session_id = ?1`)
		.bind(params.id)
		.all<{ id: string }>();

	const snapshots = [];
	for (const question of questions) {
		const { results: answers } = await db
			.prepare(
				`SELECT realistic FROM wbd_answers WHERE question_id = ?1 AND round_number = ?2 AND realistic IS NOT NULL`
			)
			.bind(question.id, round_number)
			.all<{ realistic: number }>();

		const stats = computeRoundStats(answers.map((a: { realistic: number }) => a.realistic));
		const snapshot = await db
			.prepare(
				`INSERT INTO wbd_round_snapshots
				 (id, session_id, round_number, question_id, count_responses, median, q1, q3, min_value, max_value, consensus_level)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
				 ON CONFLICT(session_id, round_number, question_id) DO UPDATE SET
				   count_responses = excluded.count_responses,
				   median = excluded.median,
				   q1 = excluded.q1,
				   q3 = excluded.q3,
				   min_value = excluded.min_value,
				   max_value = excluded.max_value,
				   consensus_level = excluded.consensus_level
				 RETURNING *`
			)
			.bind(
				generateId(),
				params.id,
				round_number,
				question.id,
				stats.count,
				stats.median,
				stats.q1,
				stats.q3,
				stats.min,
				stats.max,
				stats.consensusLevel
			)
			.first();
		snapshots.push(snapshot);
	}

	return json(snapshots, { status: 201 });
};
