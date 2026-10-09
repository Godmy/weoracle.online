import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	ManagerAuth.requireRole(cookies, ['admin']);
	const db = platform!.env.DB;
	const entries = await ManagerAuditLog.list(db, url.searchParams.get('sessionId'));
	return json(entries);
};
