import { generateId } from '$lib/server/wbd/db';

// Structural subset of the real (ambient, unimported) D1Database type — see note in
// src/lib/server/wbd/db.ts about why bindings are accessed without importing global Workers types.
interface D1Like {
	prepare(query: string): {
		bind(...values: unknown[]): { run(): Promise<unknown> };
	};
}

export interface AuditEvent {
	actorUserId: string | null;
	sessionId?: string | null;
	action: string;
	entityType: 'user' | 'session' | 'session_expert' | 'question' | 'answer' | 'round' | 'discussion' | 'report' | 'system';
	entityId?: string | null;
	metadata?: Record<string, unknown>;
}

export async function recordAuditEvent(db: D1Like, event: AuditEvent): Promise<void> {
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
