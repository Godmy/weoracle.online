import type { D1Like } from '$lib/server/wbd/db';
import { generateId, generateToken } from '$lib/server/wbd/db';

export interface CreateSessionExpertInput {
	email: string;
	name?: string;
	company?: string;
	alias?: string;
}

/** Get-or-creates the expert's user record, then adds them to the session with a fresh invite token. */
export async function createSessionExpert(db: D1Like, sessionId: string, input: CreateSessionExpertInput) {
	const { email, name, company, alias } = input;

	const user = await db
		.prepare(
			`INSERT INTO wbd_users (id, email, name, company, role)
			 VALUES (?1, ?2, ?3, ?4, 'expert')
			 ON CONFLICT(email) DO UPDATE SET name = excluded.name, company = excluded.company
			 RETURNING *`
		)
		.bind(generateId(), email, name?.trim() || email.split('@')[0], company ?? null)
		.first<{ id: string }>();

	const existingCount = await db
		.prepare(`SELECT COUNT(*) AS n FROM wbd_session_experts WHERE session_id = ?1`)
		.bind(sessionId)
		.first<{ n: number }>();

	return db
		.prepare(
			`INSERT INTO wbd_session_experts (id, session_id, user_id, token, alias)
			 VALUES (?1, ?2, ?3, ?4, ?5)
			 RETURNING *`
		)
		.bind(generateId(), sessionId, user!.id, generateToken(), alias?.trim() || `Expert ${(existingCount?.n ?? 0) + 1}`)
		.first<{ id: string; session_id: string; user_id: string; token: string; alias: string }>();
}

/** Cookie holding a self-served public expert's invite token, scoped to one session. */
export function publicExpertCookieName(sessionId: string): string {
	return `wbd_public_expert_${sessionId}`;
}
