import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EXPERTS_BY_SESSION_SQL } from '$lib/server/wbd/db';
import { requireSessionOwner } from '$lib/server/wbd/auth';

interface AnswerRow {
	id: string;
	question_id: string;
	round_number: number;
	expert_token: string;
	optimistic: number | null;
	realistic: number | null;
	pessimistic: number | null;
	rationale: string | null;
	confidence: number | null;
	submitted_at: string | null;
	updated_at: string | null;
}

/**
 * One-shot read model for a session's round: session, questions, experts, every answer for
 * the round (grouped by question), and any stored snapshot per question. Saves the dashboard
 * from N+1 fetching one endpoint per question.
 */
export const GET: RequestHandler = async ({ params, url, cookies, platform }) => {
	const round = url.searchParams.get('round');
	if (!round) error(400, 'round query param is required');

	const db = platform!.env.DB;
	await requireSessionOwner(cookies, db, params.id);

	const session = await db.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`).bind(params.id).first();
	if (!session) error(404, 'Session not found');

	const [{ results: questions }, { results: experts }, { results: answers }, { results: snapshots }] =
		await Promise.all([
			db
				.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
				.bind(params.id)
				.all(),
			db.prepare(EXPERTS_BY_SESSION_SQL).bind(params.id).all(),
			db
				.prepare(
					`SELECT a.* FROM wbd_answers a
					 JOIN wbd_questions q ON q.id = a.question_id
					 WHERE q.session_id = ?1 AND a.round_number = ?2`
				)
				.bind(params.id, round)
				.all<AnswerRow>(),
			db
				.prepare(`SELECT * FROM wbd_round_snapshots WHERE session_id = ?1 AND round_number = ?2`)
				.bind(params.id, round)
				.all()
		]);

	const answersByQuestion: Record<string, AnswerRow[]> = {};
	for (const answer of answers) {
		(answersByQuestion[answer.question_id] ??= []).push(answer);
	}
	const snapshotByQuestion: Record<string, unknown> = {};
	for (const snapshot of snapshots as { question_id: string }[]) {
		snapshotByQuestion[snapshot.question_id] = snapshot;
	}

	return json({ session, questions, experts, answersByQuestion, snapshotByQuestion });
};
