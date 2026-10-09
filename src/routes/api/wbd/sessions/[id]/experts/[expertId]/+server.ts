import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';
import { ManagerExpert } from '$lib/server/class/manager/expert';

export const DELETE: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	await ManagerExpert.remove(db, params.id, params.expertId);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: params.id,
		action: 'expert_removed',
		entityType: 'session_expert',
		entityId: params.expertId
	});

	return json({ id: params.expertId });
};

/** Regenerates an expert's invite token (used for "resend invite" — the link changes, the old one stops working). */
export const POST: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);
	const result = await ManagerExpert.resendInvite(db, params.id, params.expertId);
	return json(result);
};
