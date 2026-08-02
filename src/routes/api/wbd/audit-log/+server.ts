import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/wbd/auth';

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	requireRole(cookies, ['admin']);

	const sessionId = url.searchParams.get('sessionId');
	const db = platform!.env.DB;
	const query = sessionId
		? db
				.prepare(
					`SELECT al.*, u.name AS actor_name, u.email AS actor_email
					 FROM wbd_audit_log al
					 LEFT JOIN wbd_users u ON u.id = al.actor_user_id
					 WHERE al.session_id = ?1
					 ORDER BY al.created_at DESC
					 LIMIT 200`
				)
				.bind(sessionId)
		: db.prepare(
				`SELECT al.*, u.name AS actor_name, u.email AS actor_email
				 FROM wbd_audit_log al
				 LEFT JOIN wbd_users u ON u.id = al.actor_user_id
				 ORDER BY al.created_at DESC
				 LIMIT 200`
			);

	const { results } = await query.all();
	return json(results);
};
