import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerUser } from '$lib/server/class/manager/user';

export const GET: RequestHandler = async ({ cookies, platform }) => {
	ManagerAuth.requireRole(cookies, ['admin']);
	const db = platform!.env.DB;
	const users = await ManagerUser.list(db);
	return json(users);
};

/**
 * Get-or-create a user by email — this is the magic-link sign-in entry point (see
 * /app/verify), so it's unauthenticated by design. Role is always 'coordinator': letting the
 * client set it (as an earlier version did) would let anyone self-register as 'admin' for any
 * email they don't already own a row for. Real role changes go through admin-only
 * PATCH /api/wbd/users/[id].
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.email !== 'string' || typeof body.name !== 'string') {
		error(400, 'email and name are required');
	}

	const db = platform!.env.DB;
	const result = await ManagerUser.upsertCoordinator(db, body);
	return json(result, { status: 201 });
};
