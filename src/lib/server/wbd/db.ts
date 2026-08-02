// Structural subset of the real (ambient, unimported) D1Database type — covers the
// prepare().bind().first()/.all()/.run() shape used throughout src/lib/server/wbd and
// src/routes/api/wbd. See the note below on why it's not the real ambient D1Database.
export interface D1Like {
	prepare(query: string): {
		bind(...values: unknown[]): {
			first<T = unknown>(): Promise<T | null>;
			all<T = unknown>(): Promise<{ results: T[] }>;
			run(): Promise<unknown>;
		};
	};
}

// `platform.env.*` bindings (D1Database, KVNamespace, R2Bucket, SendEmail, ...) are accessed
// untyped (or via small local structural interfaces, e.g. KVLike in magic-link.ts) rather than
// importing the real ambient types. Both `@cloudflare/workers-types` and including
// `worker-configuration.d.ts` in the TS program redeclare global `Request`/`Response`/etc. in a
// way that conflicts with lib.dom, making `request.json()` untypeable across the whole app
// (see git history around removing `@cloudflare/workers-types`). Don't reintroduce either.

export function generateId(): string {
	return crypto.randomUUID();
}

export function generateToken(): string {
	return crypto.randomUUID();
}

export function nowIso(): string {
	return new Date().toISOString();
}

/** Experts joined with their user record, plus a status derived from joined_at, for a given session. */
export const EXPERTS_BY_SESSION_SQL = `
	SELECT
		se.id,
		se.session_id,
		se.user_id,
		se.token,
		se.alias,
		se.invited_at,
		se.joined_at,
		u.email,
		u.name,
		CASE WHEN se.joined_at IS NOT NULL THEN 'joined' ELSE 'invited' END AS status
	FROM wbd_session_experts se
	JOIN wbd_users u ON u.id = se.user_id
	WHERE se.session_id = ?1
	ORDER BY se.invited_at
`;

/** Maps a raw D1/SQLite constraint failure to an HTTP status + message. */
export function mapD1Error(err: unknown): { status: number; message: string } {
	const message = err instanceof Error ? err.message : String(err);
	if (message.includes('UNIQUE constraint failed')) {
		return { status: 409, message: 'Conflicts with an existing record' };
	}
	if (message.includes('FOREIGN KEY constraint failed')) {
		return { status: 400, message: 'References a record that does not exist' };
	}
	if (message.includes('CHECK constraint failed')) {
		return { status: 400, message: 'Value violates a field constraint' };
	}
	return { status: 500, message: 'Database error' };
}
