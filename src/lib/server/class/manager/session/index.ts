import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdSessionRow } from '$lib/server/interface/db/session';
import type { WbdQuestionRow } from '$lib/server/interface/db/question';
import type { WbdExpertRow } from '$lib/server/interface/db/expert';
import { EXPERTS_BY_SESSION_SQL } from '$lib/server/const/value/experts-by-session-sql';
import { generateUlid } from '$lib/server/function/generate/ulid';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';
import { nowIso } from '$lib/server/function/time/now-iso';
import { toStructSession } from '$lib/server/function/transform/to-struct-session';
import { toStructQuestion } from '$lib/server/function/transform/to-struct-question';
import { toStructExpert } from '$lib/server/function/transform/to-struct-expert';

const STATUSES = ['draft', 'active', 'round_1', 'round_2', 'round_3', 'completed'] as const;
const PATCHABLE_COLUMNS = new Set([
	'title',
	'description',
	'image_url',
	'is_public',
	'max_rounds',
	'assumptions',
	'status',
	'current_round',
	'started_at',
	'completed_at'
]);

const LIST_SQL = `
	SELECT
		s.*,
		(SELECT COUNT(*) FROM wbd_session_experts se WHERE se.session_id = s.id) AS expert_count,
		(SELECT COUNT(*) FROM wbd_questions q WHERE q.session_id = s.id) AS question_count,
		(SELECT COUNT(*) FROM wbd_answers a
		   JOIN wbd_questions q ON q.id = a.question_id
		   WHERE q.session_id = s.id AND a.round_number = s.current_round) AS response_count
	FROM wbd_sessions s
`;

export interface CreateSessionInput {
	title: string;
	description?: string;
	image_url?: string | null;
	is_public?: boolean | number;
	max_rounds?: number;
	assumptions?: string;
}

export class ManagerSession {
	/** `createdBy = null` returns every session (admin, no filter); otherwise scoped to the owner. */
	static async list(db: D1Like, createdBy: string | null) {
		const stmt = createdBy
			? db.prepare(`${LIST_SQL} WHERE s.created_by = ?1 ORDER BY s.created_at DESC`).bind(createdBy)
			: db.prepare(`${LIST_SQL} ORDER BY s.created_at DESC`).bind();
		const { results } = await stmt.all<WbdSessionRow>();
		return results.map(toStructSession);
	}

	static async create(db: D1Like, actorId: string, input: CreateSessionInput) {
		const imageUrl = ManagerSession.normalizeImageUrl(input.image_url);
		const isPublic = ManagerSession.normalizeVisibility(input.is_public);

		try {
			// created_by is always the signed-in actor, never a client-supplied value — otherwise
			// anyone could attribute a session to an arbitrary user id.
			const result = await db
				.prepare(
					`INSERT INTO wbd_sessions (id, title, description, image_url, is_public, max_rounds, assumptions, created_by)
					 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
					 RETURNING *`
				)
				.bind(
					generateUlid(),
					input.title,
					input.description ?? null,
					imageUrl,
					isPublic,
					input.max_rounds ?? 3,
					input.assumptions ?? null,
					actorId
				)
				.first<WbdSessionRow>();
			return result ? toStructSession(result) : result;
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}

	/**
	 * `createdBy` is tacked onto the Struct session here (not part of the shared display Struct) —
	 * `/app/[id]/analytics` needs it server-side to decide whether the current viewer is the owner.
	 */
	static async getDetail(db: D1Like, sessionId: string) {
		const session = await db
			.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`)
			.bind(sessionId)
			.first<WbdSessionRow>();
		if (!session) error(404, 'Session not found');

		const [{ results: questions }, { results: experts }] = await Promise.all([
			db
				.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
				.bind(sessionId)
				.all<WbdQuestionRow>(),
			db.prepare(EXPERTS_BY_SESSION_SQL).bind(sessionId).all<WbdExpertRow>()
		]);

		return {
			...toStructSession(session),
			createdBy: session.created_by,
			questions: questions.map((row) => toStructQuestion(row)),
			experts: experts.map((row) => ({ ...toStructExpert(row), token: row.token }))
		};
	}

	static async update(db: D1Like, sessionId: string, patch: Record<string, unknown>) {
		if ('status' in patch && !STATUSES.includes(patch.status as (typeof STATUSES)[number])) {
			error(400, `status must be one of ${STATUSES.join(', ')}`);
		}
		if ('title' in patch && String(patch.title ?? '').trim().length === 0) {
			error(400, 'title is required');
		}
		if ('max_rounds' in patch) {
			const maxRounds = Number(patch.max_rounds);
			if (!Number.isInteger(maxRounds) || maxRounds < 1) {
				error(400, 'max_rounds must be a positive integer');
			}
			patch.max_rounds = maxRounds;
		}
		if ('image_url' in patch) {
			patch.image_url = ManagerSession.normalizeImageUrl(patch.image_url);
		}
		if ('is_public' in patch) {
			patch.is_public = ManagerSession.normalizeVisibility(patch.is_public);
		}

		const entries = Object.entries(patch).filter(([key]) => PATCHABLE_COLUMNS.has(key));
		if (entries.length === 0)
			error(400, `No patchable fields provided (${[...PATCHABLE_COLUMNS].join(', ')})`);

		const setClause = entries.map(([key], i) => `${key} = ?${i + 1}`).join(', ');
		const values = entries.map(([, value]) => value);

		try {
			const result = await db
				.prepare(
					`UPDATE wbd_sessions SET ${setClause} WHERE id = ?${entries.length + 1} RETURNING *`
				)
				.bind(...values, sessionId)
				.first<WbdSessionRow>();
			if (!result) error(404, 'Session not found');
			return { session: toStructSession(result), patchedFields: entries.map(([key]) => key) };
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}

	/** Advances to the next round, or marks the session completed once max_rounds is reached. */
	static async advanceRound(db: D1Like, sessionId: string) {
		const session = await db
			.prepare(`SELECT current_round, max_rounds FROM wbd_sessions WHERE id = ?1`)
			.bind(sessionId)
			.first<{ current_round: number; max_rounds: number }>();
		if (!session) error(404, 'Session not found');

		const nextRound = session.current_round + 1;
		const completed = nextRound > session.max_rounds;
		// The status enum only names round_1..round_3 explicitly (the common case); sessions
		// configured with more rounds stay 'active' once past that, current_round stays authoritative.
		const status = completed ? 'completed' : nextRound <= 3 ? `round_${nextRound}` : 'active';
		const result = await db
			.prepare(
				`UPDATE wbd_sessions
				 SET current_round = ?1,
				     status = ?2,
				     started_at = COALESCE(started_at, ?3),
				     completed_at = ?4
				 WHERE id = ?5
				 RETURNING *`
			)
			.bind(
				completed ? session.max_rounds : nextRound,
				status,
				nowIso(),
				completed ? nowIso() : null,
				sessionId
			)
			.first<WbdSessionRow>();

		return {
			session: result ? toStructSession(result) : result,
			completed,
			round: completed ? session.max_rounds : nextRound
		};
	}

	static async reset(db: D1Like, sessionId: string) {
		const existing = await db
			.prepare(`SELECT id FROM wbd_sessions WHERE id = ?1`)
			.bind(sessionId)
			.first();
		if (!existing) error(404, 'Session not found');

		try {
			await ManagerSession.deleteProgressData(db, sessionId);
			const result = await db
				.prepare(
					`UPDATE wbd_sessions
					 SET status = 'draft',
					     current_round = 0,
					     started_at = NULL,
					     completed_at = NULL
					 WHERE id = ?1
					 RETURNING *`
				)
				.bind(sessionId)
				.first<WbdSessionRow>();
			return result ? toStructSession(result) : result;
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}

	static async delete(db: D1Like, sessionId: string): Promise<void> {
		const existing = await db
			.prepare(`SELECT id FROM wbd_sessions WHERE id = ?1`)
			.bind(sessionId)
			.first();
		if (!existing) error(404, 'Session not found');
		await ManagerSession.deleteTree(db, sessionId);
	}

	private static async deleteProgressData(db: D1Like, sessionId: string): Promise<void> {
		await db
			.prepare(
				`DELETE FROM wbd_discussion_messages
				 WHERE question_id IN (SELECT id FROM wbd_questions WHERE session_id = ?1)`
			)
			.bind(sessionId)
			.run();
		await db
			.prepare(
				`DELETE FROM wbd_answers
				 WHERE question_id IN (SELECT id FROM wbd_questions WHERE session_id = ?1)`
			)
			.bind(sessionId)
			.run();
		await db.prepare(`DELETE FROM wbd_round_snapshots WHERE session_id = ?1`).bind(sessionId).run();
		await db.prepare(`DELETE FROM wbd_round_settings WHERE session_id = ?1`).bind(sessionId).run();
		await db.prepare(`DELETE FROM wbd_final_reports WHERE session_id = ?1`).bind(sessionId).run();
	}

	private static async deleteTree(db: D1Like, sessionId: string): Promise<void> {
		await ManagerSession.deleteProgressData(db, sessionId);
		await db.prepare(`DELETE FROM wbd_session_experts WHERE session_id = ?1`).bind(sessionId).run();
		await db.prepare(`DELETE FROM wbd_questions WHERE session_id = ?1`).bind(sessionId).run();
		await db.prepare(`DELETE FROM wbd_audit_log WHERE session_id = ?1`).bind(sessionId).run();
		await db.prepare(`DELETE FROM wbd_sessions WHERE id = ?1`).bind(sessionId).run();
	}

	private static normalizeImageUrl(value: unknown): string | null {
		if (value == null || value === '') return null;
		if (typeof value !== 'string') error(400, 'image_url must be a string');
		const trimmed = value.trim();
		if (!trimmed) return null;
		if (trimmed.length > 2048) error(400, 'image_url is too long');
		if (trimmed.startsWith('/')) return trimmed;
		try {
			const url = new URL(trimmed);
			if (url.protocol === 'http:' || url.protocol === 'https:') return trimmed;
		} catch {
			error(400, 'image_url must be an absolute http(s) URL or an app-relative path');
		}
		error(400, 'image_url must be an absolute http(s) URL or an app-relative path');
	}

	private static normalizeVisibility(value: unknown): 0 | 1 {
		if (value == null) return 0;
		if (value === true || value === 1) return 1;
		if (value === false || value === 0) return 0;
		error(400, 'is_public must be a boolean');
	}
}
