// Maps snake_case D1 rows (see ./types.ts) onto the camelCase Struct* shapes stylist-svelte's
// wbd components expect (stylist-svelte/src/lib/wbd/type/struct/**).
import type {
	WbdAnswerRow,
	WbdDiscussionMessageRow,
	WbdExpertRow,
	WbdQuestionRow,
	WbdSessionRow,
	WbdSnapshotRow
} from './types';

export function toStructSession(row: WbdSessionRow) {
	return {
		id: row.id,
		title: row.title,
		description: row.description ?? undefined,
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

export function toStructQuestion(row: WbdQuestionRow) {
	return {
		id: row.id,
		sessionId: row.session_id,
		orderIndex: row.order_index,
		category: row.category ?? undefined,
		text: row.text,
		type: row.type,
		unit: row.unit ?? undefined,
		minValue: row.min_value ?? undefined,
		maxValue: row.max_value ?? undefined,
		required: row.required === 1
	};
}

export function toStructExpert(row: WbdExpertRow) {
	return {
		id: row.id,
		sessionId: row.session_id,
		email: row.email,
		name: row.name,
		alias: row.alias,
		invitedAt: row.invited_at,
		joinedAt: row.joined_at ?? undefined,
		status: row.status
	};
}

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

export function toStructDiscussionMessage(row: WbdDiscussionMessageRow, ownToken?: string) {
	return {
		id: row.id,
		questionId: row.question_id,
		roundNumber: row.round_number,
		alias: row.alias,
		message: row.message,
		parentId: row.parent_id ?? undefined,
		createdAt: row.created_at,
		isOwn: ownToken ? row.expert_token === ownToken : undefined
	};
}
