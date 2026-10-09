import type { WbdDiscussionMessageRow } from '$lib/server/interface/db/discussion-message';

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
