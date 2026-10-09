import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerQuestion } from '$lib/server/class/manager/question';

export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);
	const questions = await ManagerQuestion.listForSession(db, params.id);
	return json(questions);
};

export const POST: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.text !== 'string' || typeof body.type !== 'string') {
		error(400, 'text and type are required');
	}

	const result = await ManagerQuestion.create(db, params.id, body);
	return json(result, { status: 201 });
};
