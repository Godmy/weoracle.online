import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error } from '$lib/server/wbd/db';

const ROLES = ['coordinator', 'expert', 'admin'] as const;

/** Get-or-create a user by email — the app has no login flow yet, this is the identity entry point. */
export const POST: RequestHandler = async ({ request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.email !== 'string' || typeof body.name !== 'string') {
		error(400, 'email and name are required');
	}
	const { email, name, company, role } = body as {
		email: string;
		name: string;
		company?: string;
		role?: string;
	};
	const resolvedRole = role ?? 'expert';
	if (!ROLES.includes(resolvedRole as (typeof ROLES)[number])) {
		error(400, `role must be one of ${ROLES.join(', ')}`);
	}

	const db = platform!.env.DB;
	try {
		const result = await db
			.prepare(
				`INSERT INTO wbd_users (id, email, name, company, role)
				 VALUES (?1, ?2, ?3, ?4, ?5)
				 ON CONFLICT(email) DO UPDATE SET name = excluded.name, company = excluded.company
				 RETURNING *`
			)
			.bind(generateId(), email, name, company ?? null, resolvedRole)
			.first();
		return json(result, { status: 201 });
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};
