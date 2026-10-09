import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdUser } from '$lib/server/interface/db/user';
import { generateId } from '$lib/server/function/generate/id';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';
import { toStructUser } from '$lib/server/function/transform/to-struct-user';

const ROLES = ['coordinator', 'expert', 'admin'] as const;

export class ManagerUser {
	static async list(db: D1Like) {
		const { results } = await db
			.prepare(
				`SELECT id, email, name, company, role, created_at FROM wbd_users ORDER BY created_at`
			)
			.bind()
			.all<WbdUser>();
		return results.map(toStructUser);
	}

	/**
	 * Get-or-create a user by email — this is the magic-link sign-in entry point (see
	 * /app/verify), so it's unauthenticated by design. Role is always 'coordinator': letting the
	 * client set it (as an earlier version did) would let anyone self-register as 'admin' for any
	 * email they don't already own a row for. Real role changes go through `updateRole`.
	 *
	 * Returns the raw row (not the Struct form) — the caller (/app/verify) stores this directly as
	 * the `wbd_user` session cookie, which `ManagerAuth.getSessionUser` later reads back as `WbdUser`.
	 */
	static async upsertCoordinator(
		db: D1Like,
		input: { email: string; name: string; company?: string }
	): Promise<WbdUser | null | undefined> {
		try {
			return await db
				.prepare(
					`INSERT INTO wbd_users (id, email, name, company, role)
					 VALUES (?1, ?2, ?3, ?4, 'coordinator')
					 ON CONFLICT(email) DO UPDATE SET name = excluded.name, company = excluded.company
					 RETURNING *`
				)
				.bind(generateId(), input.email, input.name, input.company ?? null)
				.first<WbdUser>();
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}

	static async updateRole(db: D1Like, userId: string, role: string) {
		if (!ROLES.includes(role as (typeof ROLES)[number])) {
			error(400, `role must be one of ${ROLES.join(', ')}`);
		}

		const previous = await db
			.prepare(`SELECT email, role FROM wbd_users WHERE id = ?1`)
			.bind(userId)
			.first<{ email: string; role: string }>();
		if (!previous) error(404, 'User not found');

		try {
			const result = await db
				.prepare(
					`UPDATE wbd_users SET role = ?1 WHERE id = ?2 RETURNING id, email, name, company, role, created_at`
				)
				.bind(role, userId)
				.first<WbdUser>();
			return {
				user: result ? toStructUser(result) : result,
				previousRole: previous.role,
				email: previous.email
			};
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}
}
