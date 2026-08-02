import { error } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/wbd/db';
import type { WbdUser } from '$lib/wbd/types';

const COOKIE = 'wbd_user';

export function getSessionUser(cookies: Cookies): WbdUser | null {
	const raw = cookies.get(COOKIE);
	return raw ? (JSON.parse(raw) as WbdUser) : null;
}

export function requireRole(cookies: Cookies, roles: WbdUser['role'][]): WbdUser {
	const user = getSessionUser(cookies);
	if (!user) error(401, 'Sign-in required');
	if (!roles.includes(user.role)) error(403, 'Forbidden');
	return user;
}

/** Coordinator/admin only, and — unless admin — must own the session (wbd_sessions.created_by). */
export async function requireSessionOwner(cookies: Cookies, db: D1Like, sessionId: string): Promise<WbdUser> {
	const user = requireRole(cookies, ['coordinator', 'admin']);
	if (user.role === 'admin') return user;

	const session = await db
		.prepare(`SELECT created_by FROM wbd_sessions WHERE id = ?1`)
		.bind(sessionId)
		.first<{ created_by: string }>();
	if (!session) error(404, 'Session not found');
	if (session.created_by !== user.id) error(403, 'Forbidden');
	return user;
}

/** Same as requireSessionOwner, but resolves the owning session through a question id. */
export async function requireQuestionOwner(cookies: Cookies, db: D1Like, questionId: string): Promise<WbdUser> {
	const user = requireRole(cookies, ['coordinator', 'admin']);
	if (user.role === 'admin') return user;

	const row = await db
		.prepare(
			`SELECT s.created_by FROM wbd_questions q JOIN wbd_sessions s ON s.id = q.session_id WHERE q.id = ?1`
		)
		.bind(questionId)
		.first<{ created_by: string }>();
	if (!row) error(404, 'Question not found');
	if (row.created_by !== user.id) error(403, 'Forbidden');
	return user;
}

/** True if `token` is a valid wbd_session_experts token for the session that owns `questionId`. */
export async function isExpertOnQuestion(db: D1Like, questionId: string, token: string): Promise<boolean> {
	const row = await db
		.prepare(
			`SELECT 1 FROM wbd_session_experts se JOIN wbd_questions q ON q.session_id = se.session_id
			 WHERE se.token = ?1 AND q.id = ?2`
		)
		.bind(token, questionId)
		.first();
	return row !== null;
}

/**
 * Read access to a question's data (answers/discussion): either the owning session's
 * coordinator/admin (cookie), or an expert holding a valid invite token for that session
 * (query/body param, not a cookie — experts never sign in). Tries the token first since
 * it's cheap and unambiguous; falls back to the cookie-based session-owner check.
 */
export async function requireQuestionAccess(
	cookies: Cookies,
	db: D1Like,
	questionId: string,
	expertToken?: string | null
): Promise<{ actorUserId: string | null }> {
	if (expertToken && (await isExpertOnQuestion(db, questionId, expertToken))) {
		return { actorUserId: null };
	}

	const user = getSessionUser(cookies);
	if (user) {
		const row = await db
			.prepare(
				`SELECT s.created_by FROM wbd_questions q JOIN wbd_sessions s ON s.id = q.session_id WHERE q.id = ?1`
			)
			.bind(questionId)
			.first<{ created_by: string }>();
		if (row && (user.role === 'admin' || row.created_by === user.id)) {
			return { actorUserId: user.id };
		}
	}

	error(403, 'Forbidden');
}
