import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';
import { ManagerUser } from '$lib/server/class/manager/user';

export const PATCH: RequestHandler = async ({ params, request, cookies, platform }) => {
	const actor = ManagerAuth.requireRole(cookies, ['admin']);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.role !== 'string') error(400, 'role is required');

	const db = platform!.env.DB;
	const { user, previousRole, email } = await ManagerUser.updateRole(db, params.id, body.role);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		action: 'role_changed',
		entityType: 'user',
		entityId: params.id,
		metadata: { from: previousRole, to: body.role, email }
	});

	return json(user);
};
