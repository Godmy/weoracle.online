import type { WbdSessionRow } from '$lib/server/interface/db/session';

export function toStructSession(row: WbdSessionRow) {
	return {
		id: row.id,
		title: row.title,
		description: row.description ?? undefined,
		imageUrl: row.image_url ?? undefined,
		isPublic: row.is_public === 1,
		assumptions: row.assumptions ?? undefined,
		status: row.status,
		currentRound: row.current_round,
		maxRounds: row.max_rounds,
		expertCount: row.expert_count,
		questionCount: row.question_count,
		responseCount: row.response_count,
		createdAt: row.created_at,
		startedAt: row.started_at ?? undefined,
		completedAt: row.completed_at ?? undefined
	};
}
