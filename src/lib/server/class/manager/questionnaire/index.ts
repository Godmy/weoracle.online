import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAnswer } from '$lib/server/class/manager/answer';
import type { SubmitAnswerInput } from '$lib/server/class/manager/answer';
import { ManagerDiscussion } from '$lib/server/class/manager/discussion';
import type { PostDiscussionMessageInput } from '$lib/server/class/manager/discussion';

/**
 * Facade over `ManagerAnswer`/`ManagerDiscussion` for the expert-facing questionnaire round
 * (`/invite/[token]`, `/public/band/[ulid]`) — the single place those two pages' `load` and
 * `actions` reach into for a question's discussion thread, an answer submission, or a discussion
 * reply.
 */
export class ManagerQuestionnaire {
	/** Discussion thread for one question/round, scoped to an expert's own invite token. */
	static async loadDiscussion(db: D1Like, questionId: string, round: number, expertToken: string) {
		if (!(await ManagerAuth.isExpertOnQuestion(db, questionId, expertToken))) {
			error(403, 'Token is not an expert on this question’s session');
		}
		return ManagerDiscussion.listForQuestion(db, questionId, String(round), expertToken);
	}

	static submitAnswer(db: D1Like, questionId: string, input: SubmitAnswerInput) {
		return ManagerAnswer.submit(db, questionId, input);
	}

	static submitDiscussionMessage(
		db: D1Like,
		questionId: string,
		input: PostDiscussionMessageInput
	) {
		return ManagerDiscussion.post(db, questionId, input);
	}
}
