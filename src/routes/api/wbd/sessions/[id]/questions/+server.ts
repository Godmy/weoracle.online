import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error } from '$lib/server/wbd/db';
import { requireSessionOwner } from '$lib/server/wbd/auth';

const TYPES = ['numeric', 'percentage', 'boolean'] as const;

export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await requireSessionOwner(cookies, db, params.id);

	const { results } = await db
		.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
		.bind(params.id)
		.all();
	return json(results);
};

export const POST: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	await requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.text !== 'string' || typeof body.type !== 'string') {
		error(400, 'text and type are required');
	}
	const { text, type, category, unit, min_value, max_value, required } = body as {
		text: string;
		type: string;
		category?: string;
		unit?: string;
		min_value?: number;
		max_value?: number;
		required?: boolean;
	};
	if (!TYPES.includes(type as (typeof TYPES)[number])) {
		error(400, `type must be one of ${TYPES.join(', ')}`);
	}

	try {
		const nextOrder = await db
			.prepare(`SELECT COALESCE(MAX(order_index) + 1, 0) AS next FROM wbd_questions WHERE session_id = ?1`)
			.bind(params.id)
			.first<{ next: number }>();

		const result = await db
			.prepare(
				`INSERT INTO wbd_questions
				 (id, session_id, order_index, category, text, type, unit, min_value, max_value, required)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
				 RETURNING *`
			)
			.bind(
				generateId(),
				params.id,
				nextOrder!.next,
				category ?? null,
				text,
				type,
				unit ?? null,
				min_value ?? null,
				max_value ?? null,
				required === false ? 0 : 1
			)
			.first();
		return json(result, { status: 201 });
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};
