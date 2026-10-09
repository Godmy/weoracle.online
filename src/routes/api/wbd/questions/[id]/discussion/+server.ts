import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerDiscussion } from '$lib/server/class/manager/discussion';

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

	const messages = await ManagerDiscussion.listForQuestion(
		db,
		params.id,
		round,
		url.searchParams.get('expert_token')
	);
	return json(messages);
};

export const POST: RequestHandler = async ({ params, request, platform }) => {
	const body = await request.json().catch(() => null);
	if (
		!body ||
		typeof body.round_number !== 'number' ||
		typeof body.expert_token !== 'string' ||
		typeof body.message !== 'string'
	) {
		error(400, 'round_number, expert_token and message are required');
	}

	const db = platform!.env.DB;
	const result = await ManagerDiscussion.post(db, params.id, body);
	return json(result, { status: 201 });
};
