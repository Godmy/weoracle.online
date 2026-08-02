import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error } from '$lib/server/wbd/db';
import { requireQuestionAccess } from '$lib/server/wbd/auth';

export const GET: RequestHandler = async ({ params, url, cookies, platform }) => {
	const round = url.searchParams.get('round');
	if (!round) error(400, 'round query param is required');

	const db = platform!.env.DB;
	await requireQuestionAccess(cookies, db, params.id, url.searchParams.get('expert_token'));

	const { results } = await db
		.prepare(
			`SELECT * FROM wbd_discussion_messages WHERE question_id = ?1 AND round_number = ?2 ORDER BY created_at`
		)
		.bind(params.id, round)
		.all();
	return json(results);
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
	const { round_number, expert_token, message, parent_id } = body as {
		round_number: number;
		expert_token: string;
		message: string;
		parent_id?: string;
	};

	const db = platform!.env.DB;

	// The expert's alias is looked up from their session membership, not trusted from the client.
	const membership = await db
		.prepare(
			`SELECT se.alias FROM wbd_session_experts se
			 JOIN wbd_questions q ON q.session_id = se.session_id
			 WHERE se.token = ?1 AND q.id = ?2`
		)
		.bind(expert_token, params.id)
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
			.bind(generateId(), params.id, round_number, expert_token, membership.alias, message, parent_id ?? null)
			.first();
		return json(result, { status: 201 });
	} catch (err) {
		const { status, message: errMessage } = mapD1Error(err);
		error(status, errMessage);
	}
};
