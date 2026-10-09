import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdDiscussionMessageRow } from '$lib/server/interface/db/discussion-message';
import { generateId } from '$lib/server/function/generate/id';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';
import { toStructDiscussionMessage } from '$lib/server/function/transform/to-struct-discussion-message';

export interface PostDiscussionMessageInput {
	round_number: number;
	expert_token: string;
	message: string;
	parent_id?: string;
}

export class ManagerDiscussion {
	/** `ownToken`, when passed, flags the requester's own messages via `isOwn` in the response. */
	static async listForQuestion(
		db: D1Like,
		questionId: string,
		round: string,
		ownToken?: string | null
	) {
		const { results } = await db
			.prepare(
				`SELECT * FROM wbd_discussion_messages WHERE question_id = ?1 AND round_number = ?2 ORDER BY created_at`
			)
			.bind(questionId, round)
			.all<WbdDiscussionMessageRow>();
		return results.map((row) => toStructDiscussionMessage(row, ownToken ?? undefined));
	}

	/** The expert's alias is looked up from their session membership, not trusted from the client. */
	static async post(db: D1Like, questionId: string, input: PostDiscussionMessageInput) {
		const membership = await db
			.prepare(
				`SELECT se.alias FROM wbd_session_experts se
				 JOIN wbd_questions q ON q.session_id = se.session_id
				 WHERE se.token = ?1 AND q.id = ?2`
			)
			.bind(input.expert_token, questionId)
			.first<{ alias: string }>();
		if (!membership) error(403, 'Token is not an expert on this question’s session');

		try {
			const result = await db
				.prepare(
					`INSERT INTO wbd_discussion_messages
					 (id, question_id, round_number, expert_token, alias, message, parent_id)
					 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
					 RETURNING *`
				)
				.bind(
					generateId(),
					questionId,
					input.round_number,
					input.expert_token,
					membership.alias,
					input.message,
					input.parent_id ?? null
				)
				.first<WbdDiscussionMessageRow>();
			return result ? toStructDiscussionMessage(result, input.expert_token) : result;
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}
}
