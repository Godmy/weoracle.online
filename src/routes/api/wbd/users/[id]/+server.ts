import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mapD1Error } from '$lib/server/wbd/db';
import { requireRole } from '$lib/server/wbd/auth';
import { recordAuditEvent } from '$lib/server/wbd/audit';

const ROLES = ['coordinator', 'expert', 'admin'] as const;

export const PATCH: RequestHandler = async ({ params, request, cookies, platform }) => {
	const actor = requireRole(cookies, ['admin']);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.role !== 'string' || !ROLES.includes(body.role as (typeof ROLES)[number])) {
		error(400, `role must be one of ${ROLES.join(', ')}`);
	}
	const { role } = body as { role: (typeof ROLES)[number] };

	const db = platform!.env.DB;
	const previous = await db.prepare(`SELECT email, role FROM wbd_users WHERE id = ?1`).bind(params.id).first<{
		email: string;
		role: string;
	}>();
	if (!previous) error(404, 'User not found');

	try {
		const result = await db
			.prepare(`UPDATE wbd_users SET role = ?1 WHERE id = ?2 RETURNING id, email, name, company, role, created_at`)
			.bind(role, params.id)
			.first();

		await recordAuditEvent(db, {
			actorUserId: actor.id,
			action: 'role_changed',
			entityType: 'user',
			entityId: params.id,
			metadata: { from: previous.role, to: role, email: previous.email }
		});

		return json(result);
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};
