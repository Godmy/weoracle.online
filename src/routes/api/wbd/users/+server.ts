import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error } from '$lib/server/wbd/db';
import { requireRole } from '$lib/server/wbd/auth';

export const GET: RequestHandler = async ({ cookies, platform }) => {
	requireRole(cookies, ['admin']);

	const db = platform!.env.DB;
	const { results } = await db
		.prepare(`SELECT id, email, name, company, role, created_at FROM wbd_users ORDER BY created_at`)
		.all();
	return json(results);
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
	const { email, name, company } = body as { email: string; name: string; company?: string };

	const db = platform!.env.DB;
	try {
		const result = await db
			.prepare(
				`INSERT INTO wbd_users (id, email, name, company, role)
				 VALUES (?1, ?2, ?3, ?4, 'coordinator')
				 ON CONFLICT(email) DO UPDATE SET name = excluded.name, company = excluded.company
				 RETURNING *`
			)
			.bind(generateId(), email, name, company ?? null)
			.first();
		return json(result, { status: 201 });
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};
