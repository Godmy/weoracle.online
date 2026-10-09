import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';
import { ManagerSession } from '$lib/server/class/manager/session';

export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);
	const detail = await ManagerSession.getDetail(db, params.id);
	return json(detail);
};

export const PATCH: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') error(400, 'Invalid body');

	const { session, patchedFields } = await ManagerSession.update(
		db,
		params.id,
		body as Record<string, unknown>
	);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: params.id,
		action: 'session_updated',
		entityType: 'session',
		entityId: params.id,
		metadata: { fields: patchedFields }
	});

	return json(session);
};

// Convenience: advance a session into the next round, or mark completed once max_rounds is reached.
export const POST: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const { session, completed, round } = await ManagerSession.advanceRound(db, params.id);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: params.id,
		action: completed ? 'session_completed' : 'round_advanced',
		entityType: 'round',
		entityId: params.id,
		metadata: { round }
	});

	return json(session);
};

export const DELETE: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	await ManagerSession.delete(db, params.id);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: null,
		action: 'session_deleted',
		entityType: 'session',
		entityId: params.id
	});

	return json({ ok: true });
};
