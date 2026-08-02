import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/wbd/auth';

/** All-rounds snapshot history for a session (unlike /snapshot, which is scoped to one ?round=). */
export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const user = requireRole(cookies, ['coordinator', 'admin']);

	const db = platform!.env.DB;
	const session = await db
		.prepare(`SELECT created_by FROM wbd_sessions WHERE id = ?1`)
		.bind(params.id)
		.first<{ created_by: string }>();
	if (!session) error(404, 'Session not found');
	if (user.role !== 'admin' && session.created_by !== user.id) error(403, 'Forbidden');

	const { results } = await db
		.prepare(`SELECT * FROM wbd_round_snapshots WHERE session_id = ?1 ORDER BY round_number, question_id`)
		.bind(params.id)
		.all();
	return json(results);
};
