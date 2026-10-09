import { error, fail, isHttpError, redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import { ManagerExpert } from '$lib/server/class/manager/expert';
import { ManagerQuestionnaire } from '$lib/server/class/manager/questionnaire';
import {
	_ensureDevFuelSession,
	_isLocalDev
} from '../../invite/[ulid]/+page.server';

function numberOrUndefined(value: FormDataEntryValue | null): number | undefined {
	if (value === null || value === '') return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

function stringOrUndefined(value: FormDataEntryValue | null): string | undefined {
	const s = value === null ? '' : String(value);
	return s === '' ? undefined : s;
}

async function resolveToken(db: D1Like, cookies: Cookies, ulid: string) {
	const token = cookies.get(ManagerExpert.publicCookieName(ulid));
	if (!token) redirect(303, `/public/invite/${ulid}`);

	try {
		return { token, ...(await ManagerExpert.resolveByToken(db, token)) };
	} catch (err) {
		if (isHttpError(err) && err.status === 404) redirect(303, `/public/invite/${ulid}`);
		throw err;
	}
}

export const load: PageServerLoad = async ({ params, cookies, url, platform }) => {
	const db = platform!.env.DB;
	if (_isLocalDev(url) && params.ulid === '3d245fd6-013b-4ade-919c-2c407c2c6135') {
		await _ensureDevFuelSession(db, params.ulid);
	}

	const publicSession = await db
		.prepare(`SELECT id FROM wbd_sessions WHERE id = ?1 AND is_public = 1`)
		.bind(params.ulid)
		.first<{ id: string }>();
	if (!publicSession) error(404, 'This poll is not public or does not exist');

	const { token, expert, session, questions, answers } = await resolveToken(
		db,
		cookies,
		params.ulid
	);

	const requestedQuestionId = url.searchParams.get('question');
	const currentQuestionId = questions.some((question) => question.id === requestedQuestionId)
		? requestedQuestionId!
		: (questions[0]?.id ?? '');
	const discussionRound = numberOrUndefined(url.searchParams.get('round')) ?? session.currentRound;

	const discussionMessages = currentQuestionId
		? await ManagerQuestionnaire.loadDiscussion(db, currentQuestionId, discussionRound, token)
		: [];

	return {
		token,
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
	submitAnswer: async ({ request, params, cookies, platform }) => {
		const db = platform!.env.DB;
		const token = cookies.get(ManagerExpert.publicCookieName(params.ulid));
		if (!token) return fail(401, { message: 'Not identified for this poll' });

		const form = await request.formData();
		const questionId = stringOrUndefined(form.get('questionId'));
		const roundNumber = numberOrUndefined(form.get('roundNumber'));
		if (!questionId || roundNumber === undefined) {
			return fail(400, { message: 'questionId and roundNumber are required' });
		}

		const answer = await ManagerQuestionnaire.submitAnswer(db, questionId, {
			round_number: roundNumber,
			expert_token: token,
			optimistic: numberOrUndefined(form.get('optimistic')),
			realistic: numberOrUndefined(form.get('realistic')),
			pessimistic: numberOrUndefined(form.get('pessimistic')),
			rationale: stringOrUndefined(form.get('rationale')),
			confidence: numberOrUndefined(form.get('confidence'))
		});
		return { success: true, answer };
	},

	submitMessage: async ({ request, params, cookies, platform }) => {
		const db = platform!.env.DB;
		const token = cookies.get(ManagerExpert.publicCookieName(params.ulid));
		if (!token) return fail(401, { message: 'Not identified for this poll' });

		const form = await request.formData();
		const questionId = stringOrUndefined(form.get('questionId'));
		const roundNumber = numberOrUndefined(form.get('roundNumber'));
		const message = stringOrUndefined(form.get('message'));
		if (!questionId || roundNumber === undefined || !message) {
			return fail(400, { message: 'questionId, roundNumber and message are required' });
		}

		const discussionMessage = await ManagerQuestionnaire.submitDiscussionMessage(db, questionId, {
			round_number: roundNumber,
			expert_token: token,
			message,
			parent_id: stringOrUndefined(form.get('parentId'))
		});
		return { success: true, discussionMessage };
	}
};
