import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';
import { ManagerSession } from '$lib/server/class/manager/session';

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
	const actor = ManagerAuth.requireRole(cookies, ['coordinator', 'admin']);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.title !== 'string') {
		error(400, 'title is required');
	}

	const db = platform!.env.DB;
	const result = await ManagerSession.create(db, actor.id, body);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: result!.id,
		action: 'session_created',
		entityType: 'session',
		entityId: result!.id,
		metadata: { title: body.title }
	});

	return json(result, { status: 201 });
};

// Coordinators only ever see their own sessions, regardless of what ?created_by= says.
// Admins may pass ?created_by= to filter, or omit it to see every session.
export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const actor = ManagerAuth.requireRole(cookies, ['coordinator', 'admin']);
	const db = platform!.env.DB;
	const createdBy = actor.role === 'admin' ? url.searchParams.get('created_by') : actor.id;
	const sessions = await ManagerSession.list(db, createdBy);
	return json(sessions);
};
