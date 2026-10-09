import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';
import { ManagerExpert } from '$lib/server/class/manager/expert';

export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);
	const experts = await ManagerExpert.listForSession(db, params.id);
	return json(experts);
};

/** Invites an expert: get-or-creates their user record, then adds them to the session with a fresh invite token. */
export const POST: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.email !== 'string' || !body.email.trim()) {
		error(400, 'email is required');
	}

	const result = await ManagerExpert.invite(db, params.id, body);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: params.id,
		action: 'expert_invited',
		entityType: 'session_expert',
		entityId: result!.id,
		metadata: { email: body.email }
	});

	return json(result, { status: 201 });
};
