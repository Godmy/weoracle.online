// Maps snake_case D1 rows (see ./types.ts) onto the camelCase Struct* shapes stylist-svelte's
// wbd components expect (stylist-svelte/src/lib/wbd/type/struct/**).
import type {
	WbdAnswerRow,
	WbdAuditLogRow,
	WbdDiscussionMessageRow,
	WbdExpertRow,
	WbdQuestionRow,
	WbdSessionRow,
	WbdSnapshotRow,
	WbdUserRow
} from './types';

// StructWbdAuditLogEntry['entityType'] (stylist-svelte) doesn't have 'session_expert'/'report' —
// the DB allows a couple more values than the shared component type does, so fold them onto the
// closest existing label rather than widening the shared type for a display-only field.
const ENTITY_TYPE_MAP: Record<WbdAuditLogRow['entity_type'], 'user' | 'session' | 'question' | 'answer' | 'round' | 'discussion' | 'system'> = {
	user: 'user',
	session: 'session',
	session_expert: 'session',
	question: 'question',
	answer: 'answer',
	round: 'round',
	discussion: 'discussion',
	report: 'system',
	system: 'system'
};

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

export function toStructUser(row: WbdUserRow) {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		company: row.company ?? undefined,
		role: row.role,
		createdAt: row.created_at
	};
}

export function toStructAuditLogEntry(row: WbdAuditLogRow) {
	const metadata = row.metadata_json ? (JSON.parse(row.metadata_json) as Record<string, unknown>) : null;
	const entityLabel = metadata && typeof metadata.email === 'string' ? metadata.email : (metadata?.title as string | undefined);

	return {
		id: row.id,
		actorLabel: row.actor_name || row.actor_email || 'System',
		action: row.action,
		entityType: ENTITY_TYPE_MAP[row.entity_type],
		entityLabel,
		createdAt: row.created_at
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
