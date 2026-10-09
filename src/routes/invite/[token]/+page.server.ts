import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ManagerExpert } from '$lib/server/class/manager/expert';
import { ManagerQuestionnaire } from '$lib/server/class/manager/questionnaire';

function numberOrUndefined(value: FormDataEntryValue | null): number | undefined {
	if (value === null || value === '') return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

function stringOrUndefined(value: FormDataEntryValue | null): string | undefined {
	const s = value === null ? '' : String(value);
	return s === '' ? undefined : s;
}

export const load: PageServerLoad = async ({ params, url, platform }) => {
	const db = platform!.env.DB;
	const { expert, session, questions, answers } = await ManagerExpert.resolveByToken(
		db,
		params.token
	);

	const currentQuestionId = url.searchParams.get('question') || (questions[0]?.id ?? '');
	const discussionRound = numberOrUndefined(url.searchParams.get('round')) ?? session.currentRound;

	const discussionMessages = currentQuestionId
		? await ManagerQuestionnaire.loadDiscussion(
				db,
				currentQuestionId,
				discussionRound,
				params.token
			)
		: [];

	return {
		token: params.token,
		expert,
		session,
		questions,
		answers,
		currentQuestionId,
		discussionRound,
		discussionMessages
	};
};

export const actions: Actions = {
	submitAnswer: async ({ request, params, platform }) => {
		const db = platform!.env.DB;
		const form = await request.formData();
		const questionId = stringOrUndefined(form.get('questionId'));
		const roundNumber = numberOrUndefined(form.get('roundNumber'));
		if (!questionId || roundNumber === undefined) {
			return fail(400, { message: 'questionId and roundNumber are required' });
		}

		const answer = await ManagerQuestionnaire.submitAnswer(db, questionId, {
			round_number: roundNumber,
			expert_token: params.token,
			optimistic: numberOrUndefined(form.get('optimistic')),
			realistic: numberOrUndefined(form.get('realistic')),
			pessimistic: numberOrUndefined(form.get('pessimistic')),
			rationale: stringOrUndefined(form.get('rationale')),
			confidence: numberOrUndefined(form.get('confidence'))
		});
		return { success: true, answer };
	},

	submitMessage: async ({ request, params, platform }) => {
		const db = platform!.env.DB;
		const form = await request.formData();
		const questionId = stringOrUndefined(form.get('questionId'));
		const roundNumber = numberOrUndefined(form.get('roundNumber'));
		const message = stringOrUndefined(form.get('message'));
		if (!questionId || roundNumber === undefined || !message) {
			return fail(400, { message: 'questionId, roundNumber and message are required' });
		}

		const discussionMessage = await ManagerQuestionnaire.submitDiscussionMessage(db, questionId, {
			round_number: roundNumber,
			expert_token: params.token,
			message,
			parent_id: stringOrUndefined(form.get('parentId'))
		});
		return { success: true, discussionMessage };
	}
};
