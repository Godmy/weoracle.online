import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateToken } from '$lib/server/wbd/db';

export const DELETE: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const result = await db
		.prepare(`DELETE FROM wbd_session_experts WHERE id = ?1 AND session_id = ?2 RETURNING id`)
		.bind(params.expertId, params.id)
		.first();
	if (!result) error(404, 'Expert not found on this session');
	return json({ id: params.expertId });
};

/** Regenerates an expert's invite token (used for "resend invite" — the link changes, the old one stops working). */
export const POST: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const result = await db
		.prepare(
			`UPDATE wbd_session_experts SET token = ?1 WHERE id = ?2 AND session_id = ?3 RETURNING *`
		)
		.bind(generateToken(), params.expertId, params.id)
		.first();
	if (!result) error(404, 'Expert not found on this session');
	return json(result);
};
