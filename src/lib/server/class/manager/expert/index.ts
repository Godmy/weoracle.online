import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdExpertRow } from '$lib/server/interface/db/expert';
import type { WbdSessionRow } from '$lib/server/interface/db/session';
import type { WbdQuestionRow } from '$lib/server/interface/db/question';
import type { WbdAnswerRow } from '$lib/server/interface/db/answer';
import { EXPERTS_BY_SESSION_SQL } from '$lib/server/const/value/experts-by-session-sql';
import { generateId } from '$lib/server/function/generate/id';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';
import { nowIso } from '$lib/server/function/time/now-iso';
import { toStructExpert } from '$lib/server/function/transform/to-struct-expert';
import { toStructSession } from '$lib/server/function/transform/to-struct-session';
import { toStructQuestion } from '$lib/server/function/transform/to-struct-question';
import { toStructAnswer } from '$lib/server/function/transform/to-struct-answer';

export interface InviteExpertInput {
	email: string;
	name?: string;
	company?: string;
	alias?: string;
}

export class ManagerExpert {
	/**
	 * Coordinator-facing list: Struct-shaped for display, plus the raw invite `token` (dropped from
	 * the shared Struct shape) so the session owner can still copy invite links.
	 */
	static async listForSession(db: D1Like, sessionId: string) {
		const { results } = await db
			.prepare(EXPERTS_BY_SESSION_SQL)
			.bind(sessionId)
			.all<WbdExpertRow>();
		return results.map((row) => ({ ...toStructExpert(row), token: row.token }));
	}

	/**
	 * Get-or-creates the expert's user record, then adds them to the session with a fresh invite
	 * token. Returns the raw row (not the Struct form) — callers need the real `token`, either to
	 * build/copy an invite link (coordinator flow) or to set the public-expert cookie
	 * (/public/verify), and the Struct shape deliberately omits it.
	 */
	static async invite(db: D1Like, sessionId: string, input: InviteExpertInput) {
		const { email, name, company, alias } = input;

		try {
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

			return await db
				.prepare(
					`INSERT INTO wbd_session_experts (id, session_id, user_id, token, alias)
					 VALUES (?1, ?2, ?3, ?4, ?5)
					 RETURNING *`
				)
				.bind(
					generateId(),
					sessionId,
					user!.id,
					generateId(),
					alias?.trim() || `Expert ${(existingCount?.n ?? 0) + 1}`
				)
				.first<WbdExpertRow>();
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}

	static async remove(db: D1Like, sessionId: string, expertId: string): Promise<void> {
		const result = await db
			.prepare(`DELETE FROM wbd_session_experts WHERE id = ?1 AND session_id = ?2 RETURNING id`)
			.bind(expertId, sessionId)
			.first();
		if (!result) error(404, 'Expert not found on this session');
	}

	/** Regenerates an expert's invite token (used for "resend invite" — the link changes, the old one stops working). Raw row, same reason as `invite`. */
	static async resendInvite(db: D1Like, sessionId: string, expertId: string) {
		const result = await db
			.prepare(
				`UPDATE wbd_session_experts SET token = ?1 WHERE id = ?2 AND session_id = ?3 RETURNING *`
			)
			.bind(generateId(), expertId, sessionId)
			.first<WbdExpertRow>();
		if (!result) error(404, 'Expert not found on this session');
		return result;
	}

	/** Resolves an expert's invite token into their session view, and stamps joined_at on first visit. */
	static async resolveByToken(db: D1Like, token: string) {
		const expert = await db
			.prepare(`SELECT * FROM wbd_session_experts WHERE token = ?1`)
			.bind(token)
			.first<{ id: string; session_id: string; alias: string; joined_at: string | null }>();
		if (!expert) error(404, 'Invalid invite token');

		if (!expert.joined_at) {
			await db
				.prepare(`UPDATE wbd_session_experts SET joined_at = ?1 WHERE id = ?2`)
				.bind(nowIso(), expert.id)
				.run();
		}

		const [session, { results: questions }] = await Promise.all([
			db
				.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`)
				.bind(expert.session_id)
				.first<WbdSessionRow>(),
			db
				.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
				.bind(expert.session_id)
				.all<WbdQuestionRow>()
		]);
		if (!session) error(404, 'Session not found');

		const { results: answers } = await db
			.prepare(`SELECT * FROM wbd_answers WHERE expert_token = ?1 AND round_number = ?2`)
			.bind(token, session.current_round)
			.all<WbdAnswerRow>();

		return {
			expert: { id: expert.id, alias: expert.alias },
			session: toStructSession(session),
			questions: questions.map((row) => toStructQuestion(row)),
			answers: answers.map(toStructAnswer)
		};
	}

	/** Cookie holding a self-served public expert's invite token, scoped to one session. */
	static publicCookieName(sessionId: string): string {
		return `wbd_public_expert_${sessionId}`;
	}
}
