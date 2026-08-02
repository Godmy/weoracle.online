import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nowIso } from '$lib/server/wbd/db';

/** Resolves an expert's invite token into their session view, and stamps joined_at on first visit. */
export const GET: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const expert = await db
		.prepare(`SELECT * FROM wbd_session_experts WHERE token = ?1`)
		.bind(params.token)
		.first<{ id: string; session_id: string; alias: string; joined_at: string | null }>();
	if (!expert) error(404, 'Invalid invite token');

	if (!expert.joined_at) {
		await db
			.prepare(`UPDATE wbd_session_experts SET joined_at = ?1 WHERE id = ?2`)
			.bind(nowIso(), expert.id)
			.run();
	}

	const [session, { results: questions }] = await Promise.all([
		db.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`).bind(expert.session_id).first(),
		db
			.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
			.bind(expert.session_id)
			.all()
	]);
	if (!session) error(404, 'Session not found');

	return json({ expert: { id: expert.id, alias: expert.alias }, session, questions });
};
