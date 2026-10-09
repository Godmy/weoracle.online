import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdAnswerRow } from '$lib/server/interface/db/answer';
import type { WbdExpertRow } from '$lib/server/interface/db/expert';
import type { WbdQuestionRow, WbdQuestionType } from '$lib/server/interface/db/question';
import type { WbdSessionRow } from '$lib/server/interface/db/session';
import type { WbdSnapshotRow } from '$lib/server/interface/db/snapshot';
import { EXPERTS_BY_SESSION_SQL } from '$lib/server/const/value/experts-by-session-sql';
import { generateId } from '$lib/server/function/generate/id';
import { computeRoundStats } from '$lib/server/function/transform/compute-round-stats';
import { toStructAnswer } from '$lib/server/function/transform/to-struct-answer';
import { toStructExpert } from '$lib/server/function/transform/to-struct-expert';
import { toStructQuestion } from '$lib/server/function/transform/to-struct-question';
import { toStructSession } from '$lib/server/function/transform/to-struct-session';
import { toStructSnapshot } from '$lib/server/function/transform/to-struct-snapshot';

export class ManagerSnapshot {
	/**
	 * One-shot read model for a session's round: session, questions, experts, every answer for
	 * the round (grouped by question), and any stored snapshot per question. Saves the dashboard
	 * from N+1 fetching one endpoint per question.
	 *
	 * Experts carry the raw invite `token`, and answers carry `id`/`roundNumber`/`expertToken` on
	 * top of the shared Struct shape — the coordinator-only round page needs these (copy-link,
	 * matching submitted answers to experts, per-answer rationale ids) even though the shared
	 * Struct types omit them for other, less trusted consumers.
	 */
	static async getRoundView(db: D1Like, sessionId: string, round: string) {
		const session = await db
			.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`)
			.bind(sessionId)
			.first<WbdSessionRow>();
		if (!session) error(404, 'Session not found');

		const [
			{ results: questions },
			{ results: experts },
			{ results: answers },
			{ results: snapshots }
		] = await Promise.all([
			db
				.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
				.bind(sessionId)
				.all<WbdQuestionRow>(),
			db.prepare(EXPERTS_BY_SESSION_SQL).bind(sessionId).all<WbdExpertRow>(),
			db
				.prepare(
					`SELECT a.* FROM wbd_answers a
						 JOIN wbd_questions q ON q.id = a.question_id
						 WHERE q.session_id = ?1 AND a.round_number = ?2`
				)
				.bind(sessionId, round)
				.all<WbdAnswerRow>(),
			db
				.prepare(`SELECT * FROM wbd_round_snapshots WHERE session_id = ?1 AND round_number = ?2`)
				.bind(sessionId, round)
				.all<WbdSnapshotRow>()
		]);

		type RoundAnswer = ReturnType<typeof toStructAnswer> & {
			id: string;
			roundNumber: number;
			expertToken: string;
		};
		const answersByQuestion: Record<string, RoundAnswer[]> = {};
		for (const answer of answers) {
			const struct: RoundAnswer = {
				...toStructAnswer(answer),
				id: answer.id,
				roundNumber: answer.round_number,
				expertToken: answer.expert_token
			};
			(answersByQuestion[answer.question_id] ??= []).push(struct);
		}
		const snapshotByQuestion: Record<string, ReturnType<typeof toStructSnapshot> | undefined> = {};
		for (const snapshot of snapshots) {
			snapshotByQuestion[snapshot.question_id] = toStructSnapshot(snapshot);
		}

		return {
			session: toStructSession(session),
			questions: questions.map((row) => toStructQuestion(row)),
			experts: experts.map((row) => ({ ...toStructExpert(row), token: row.token })),
			answersByQuestion,
			snapshotByQuestion
		};
	}

	static async get(db: D1Like, sessionId: string, round: string) {
		const { results } = await db
			.prepare(`SELECT * FROM wbd_round_snapshots WHERE session_id = ?1 AND round_number = ?2`)
			.bind(sessionId, round)
			.all<WbdSnapshotRow>();
		return results.map(toStructSnapshot);
	}

	/** Computes median/quartile/consensus stats for every question in the session for one round, and stores them. */
	static async compute(db: D1Like, sessionId: string, roundNumber: number) {
		const { results: questions } = await db
			.prepare(`SELECT id, type FROM wbd_questions WHERE session_id = ?1`)
			.bind(sessionId)
			.all<{ id: string; type: WbdQuestionType }>();

		const snapshots: ReturnType<typeof toStructSnapshot>[] = [];
		for (const question of questions) {
			const { results: answers } = await db
				.prepare(
					`SELECT realistic FROM wbd_answers WHERE question_id = ?1 AND round_number = ?2 AND realistic IS NOT NULL`
				)
				.bind(question.id, roundNumber)
				.all<{ realistic: number }>();

			const stats = computeRoundStats(
				answers.map((a) => a.realistic),
				question.type
			);
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
					sessionId,
					roundNumber,
					question.id,
					stats.count,
					stats.median,
					stats.q1,
					stats.q3,
					stats.min,
					stats.max,
					stats.consensusLevel
				)
				.first<WbdSnapshotRow>();
			if (snapshot) snapshots.push(toStructSnapshot(snapshot));
		}

		return snapshots;
	}

	/** All-rounds snapshot history for a session (unlike `get`, which is scoped to one round). */
	static async listAll(db: D1Like, sessionId: string) {
		const { results } = await db
			.prepare(
				`SELECT * FROM wbd_round_snapshots WHERE session_id = ?1 ORDER BY round_number, question_id`
			)
			.bind(sessionId)
			.all<WbdSnapshotRow>();
		return results.map(toStructSnapshot);
	}
}
