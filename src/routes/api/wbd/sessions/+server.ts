import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateId, mapD1Error } from '$lib/server/wbd/db';
import { recordAuditEvent } from '$lib/server/wbd/audit';
import { requireRole } from '$lib/server/wbd/auth';

export const POST: RequestHandler = async ({ request, cookies, platform }) => {
	const actor = requireRole(cookies, ['coordinator', 'admin']);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.title !== 'string') {
		error(400, 'title is required');
	}
	const { title, description, image_url, is_public, max_rounds, assumptions } = body as {
		title: string;
		description?: string;
		image_url?: string | null;
		is_public?: boolean | number;
		max_rounds?: number;
		assumptions?: string;
	};
	const imageUrl = normalizeSessionImageUrl(image_url);
	const isPublic = normalizeSessionVisibility(is_public);

	const db = platform!.env.DB;
	try {
		// created_by is always the signed-in actor, never a client-supplied value — otherwise
		// anyone could attribute a session to an arbitrary user id.
		const result = await db
			.prepare(
				`INSERT INTO wbd_sessions (id, title, description, image_url, is_public, max_rounds, assumptions, created_by)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
				 RETURNING *`
			)
			.bind(generateId(), title, description ?? null, imageUrl, isPublic, max_rounds ?? 3, assumptions ?? null, actor.id)
			.first<{ id: string }>();

		await recordAuditEvent(db, {
			actorUserId: actor.id,
			sessionId: result!.id,
			action: 'session_created',
			entityType: 'session',
			entityId: result!.id,
			metadata: { title }
		});

		return json(result, { status: 201 });
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};

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

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const actor = requireRole(cookies, ['coordinator', 'admin']);
	const db = platform!.env.DB;

	// Coordinators only ever see their own sessions, regardless of what ?created_by= says.
	// Admins may pass ?created_by= to filter, or omit it to see every session.
	const createdBy = actor.role === 'admin' ? url.searchParams.get('created_by') : actor.id;
	const stmt = createdBy
		? db.prepare(`${LIST_SQL} WHERE s.created_by = ?1 ORDER BY s.created_at DESC`).bind(createdBy)
		: db.prepare(`${LIST_SQL} ORDER BY s.created_at DESC`);
	const { results } = await stmt.all();
	return json(results);
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
