import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';
import { ManagerSession } from '$lib/server/class/manager/session';

export const POST: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const session = await ManagerSession.reset(db, params.id);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: params.id,
		action: 'session_reset',
		entityType: 'session',
		entityId: params.id
	});

	return json(session);
};
