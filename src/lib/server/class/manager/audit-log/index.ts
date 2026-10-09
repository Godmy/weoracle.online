import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdAuditLogRow } from '$lib/server/interface/db/audit-log';
import { generateId } from '$lib/server/function/generate/id';
import { toStructAuditLogEntry } from '$lib/server/function/transform/to-struct-audit-log-entry';

export interface AuditEvent {
	actorUserId: string | null;
	sessionId?: string | null;
	action: string;
	entityType:
		| 'user'
		| 'session'
		| 'session_expert'
		| 'question'
		| 'answer'
		| 'round'
		| 'discussion'
		| 'report'
		| 'system';
	entityId?: string | null;
	metadata?: Record<string, unknown>;
}

export class ManagerAuditLog {
	static async record(db: D1Like, event: AuditEvent): Promise<void> {
		await db
			.prepare(
				`INSERT INTO wbd_audit_log (id, actor_user_id, session_id, action, entity_type, entity_id, metadata_json)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
			)
			.bind(
				generateId(),
				event.actorUserId,
				event.sessionId ?? null,
				event.action,
				event.entityType,
				event.entityId ?? null,
				event.metadata ? JSON.stringify(event.metadata) : null
			)
			.run();
	}

	/** Newest-first, optionally scoped to one session. Includes the actor's name/email via a left join. */
	static async list(db: D1Like, sessionId?: string | null) {
		const stmt = sessionId
			? db
					.prepare(
						`SELECT al.*, u.name AS actor_name, u.email AS actor_email
						 FROM wbd_audit_log al
						 LEFT JOIN wbd_users u ON u.id = al.actor_user_id
						 WHERE al.session_id = ?1
						 ORDER BY al.created_at DESC
						 LIMIT 200`
					)
					.bind(sessionId)
			: db
					.prepare(
						`SELECT al.*, u.name AS actor_name, u.email AS actor_email
						 FROM wbd_audit_log al
						 LEFT JOIN wbd_users u ON u.id = al.actor_user_id
						 ORDER BY al.created_at DESC
						 LIMIT 200`
					)
					.bind();
		const { results } = await stmt.all<WbdAuditLogRow>();
		return results.map(toStructAuditLogEntry);
	}
}
