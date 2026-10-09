import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdAnswerRow } from '$lib/server/interface/db/answer';
import { generateId } from '$lib/server/function/generate/id';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';
import { nowIso } from '$lib/server/function/time/now-iso';
import { toStructAnswer } from '$lib/server/function/transform/to-struct-answer';
import { ManagerAuth } from '$lib/server/class/manager/auth';

export interface SubmitAnswerInput {
	round_number: number;
	expert_token: string;
	optimistic?: number;
	realistic?: number;
	pessimistic?: number;
	rationale?: string;
	confidence?: number;
}

export class ManagerAnswer {
	static async listForQuestion(db: D1Like, questionId: string, round: string) {
		const { results } = await db
			.prepare(`SELECT * FROM wbd_answers WHERE question_id = ?1 AND round_number = ?2`)
			.bind(questionId, round)
			.all<WbdAnswerRow>();
		return results.map(toStructAnswer);
	}

	/** Submits or updates one expert's answer for a question in a given round. */
	static async submit(db: D1Like, questionId: string, input: SubmitAnswerInput) {
		if (!(await ManagerAuth.isExpertOnQuestion(db, questionId, input.expert_token))) {
			error(403, 'Token is not an expert on this question’s session');
		}

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
					   submitted_at = COALESCE(excluded.submitted_at, wbd_answers.submitted_at),
					   updated_at = excluded.updated_at
					 RETURNING *`
				)
				.bind(
					generateId(),
					questionId,
					input.round_number,
					input.expert_token,
					input.optimistic ?? null,
					input.realistic ?? null,
					input.pessimistic ?? null,
					input.rationale ?? null,
					input.confidence ?? null,
					now
				)
				.first<WbdAnswerRow>();
			return result ? toStructAnswer(result) : result;
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}
}
