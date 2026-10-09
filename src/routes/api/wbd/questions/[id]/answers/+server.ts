import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAnswer } from '$lib/server/class/manager/answer';

export const GET: RequestHandler = async ({ params, url, cookies, platform }) => {
	const round = url.searchParams.get('round');
	if (!round) error(400, 'round query param is required');

	const db = platform!.env.DB;
	await ManagerAuth.requireQuestionAccess(
		cookies,
		db,
		params.id,
		url.searchParams.get('expert_token')
	);

	const answers = await ManagerAnswer.listForQuestion(db, params.id, round);
	return json(answers);
};

/** Submits or updates one expert's answer for a question in a given round. */
export const POST: RequestHandler = async ({ params, request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.round_number !== 'number' || typeof body.expert_token !== 'string') {
		error(400, 'round_number and expert_token are required');
	}

	const db = platform!.env.DB;
	const result = await ManagerAnswer.submit(db, params.id, body);
	return json(result, { status: 201 });
};
