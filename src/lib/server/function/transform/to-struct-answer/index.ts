import type { WbdAnswerRow } from '$lib/server/interface/db/answer';

export function toStructAnswer(row: WbdAnswerRow) {
	return {
		questionId: row.question_id,
		optimistic: row.optimistic ?? undefined,
		realistic: row.realistic ?? undefined,
		pessimistic: row.pessimistic ?? undefined,
		rationale: row.rationale ?? undefined,
		confidence: row.confidence ?? undefined,
		submitted: row.submitted_at != null
	};
}
