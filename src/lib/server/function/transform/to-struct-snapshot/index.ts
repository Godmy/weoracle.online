import type { WbdSnapshotRow } from '$lib/server/interface/db/snapshot';

export function toStructSnapshot(row: WbdSnapshotRow) {
	return {
		id: row.id,
		sessionId: row.session_id,
		roundNumber: row.round_number,
		questionId: row.question_id,
		countResponses: row.count_responses,
		median: row.median ?? undefined,
		q1: row.q1 ?? undefined,
		q3: row.q3 ?? undefined,
		minValue: row.min_value ?? undefined,
		maxValue: row.max_value ?? undefined,
		consensusLevel: row.consensus_level ?? undefined
	};
}
