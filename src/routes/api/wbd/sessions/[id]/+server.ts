import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EXPERTS_BY_SESSION_SQL, mapD1Error, nowIso } from '$lib/server/wbd/db';
import { requireSessionOwner } from '$lib/server/wbd/auth';
import { recordAuditEvent } from '$lib/server/wbd/audit';
import { deleteSessionTree } from '$lib/server/wbd/session-cleanup';

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

export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await requireSessionOwner(cookies, db, params.id);

	const session = await db.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`).bind(params.id).first();
	if (!session) error(404, 'Session not found');

	const [{ results: questions }, { results: experts }] = await Promise.all([
		db
			.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
			.bind(params.id)
			.all(),
		db.prepare(EXPERTS_BY_SESSION_SQL).bind(params.id).all()
	]);

	return json({ ...session, questions, experts });
};

export const PATCH: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') error(400, 'Invalid body');

	if ('status' in body && !STATUSES.includes(body.status)) {
		error(400, `status must be one of ${STATUSES.join(', ')}`);
	}
	if ('title' in body && String(body.title ?? '').trim().length === 0) {
		error(400, 'title is required');
	}
	if ('max_rounds' in body) {
		const maxRounds = Number(body.max_rounds);
		if (!Number.isInteger(maxRounds) || maxRounds < 1) {
			error(400, 'max_rounds must be a positive integer');
		}
		body.max_rounds = maxRounds;
	}
	if ('image_url' in body) {
		body.image_url = normalizeSessionImageUrl(body.image_url);
	}
	if ('is_public' in body) {
		body.is_public = normalizeSessionVisibility(body.is_public);
	}

	const entries = Object.entries(body as Record<string, unknown>).filter(([key]) =>
		PATCHABLE_COLUMNS.has(key)
	);
	if (entries.length === 0) error(400, `No patchable fields provided (${[...PATCHABLE_COLUMNS].join(', ')})`);

	const setClause = entries.map(([key], i) => `${key} = ?${i + 1}`).join(', ');
	const values = entries.map(([, value]) => value);

	try {
		const result = await db
			.prepare(`UPDATE wbd_sessions SET ${setClause} WHERE id = ?${entries.length + 1} RETURNING *`)
			.bind(...values, params.id)
			.first();
		if (!result) error(404, 'Session not found');
		await recordAuditEvent(db, {
			actorUserId: actor.id,
			sessionId: params.id,
			action: 'session_updated',
			entityType: 'session',
			entityId: params.id,
			metadata: { fields: entries.map(([key]) => key) }
		});
		return json(result);
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};

// Convenience: advance a session into the next round, or mark completed once max_rounds is reached.
export const POST: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await requireSessionOwner(cookies, db, params.id);

	const session = await db
		.prepare(`SELECT current_round, max_rounds FROM wbd_sessions WHERE id = ?1`)
		.bind(params.id)
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
		.bind(completed ? session.max_rounds : nextRound, status, nowIso(), completed ? nowIso() : null, params.id)
		.first();

	await recordAuditEvent(db, {
		actorUserId: actor.id,
		sessionId: params.id,
		action: completed ? 'session_completed' : 'round_advanced',
		entityType: 'round',
		entityId: params.id,
		metadata: { round: completed ? session.max_rounds : nextRound }
	});

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await requireSessionOwner(cookies, db, params.id);

	const existing = await db.prepare(`SELECT id FROM wbd_sessions WHERE id = ?1`).bind(params.id).first();
	if (!existing) error(404, 'Session not found');

	await deleteSessionTree(db, params.id);
	await recordAuditEvent(db, {
		actorUserId: actor.id,
		sessionId: null,
		action: 'session_deleted',
		entityType: 'session',
		entityId: params.id
	});

	return json({ ok: true });
};

function normalizeSessionImageUrl(value: unknown): string | null {
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

function normalizeSessionVisibility(value: unknown): 0 | 1 {
	if (value == null) return 0;
	if (value === true || value === 1) return 1;
	if (value === false || value === 0) return 0;
	error(400, 'is_public must be a boolean');
}
