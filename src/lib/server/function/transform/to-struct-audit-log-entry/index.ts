import type { WbdAuditLogRow } from '$lib/server/interface/db/audit-log';

// StructWbdAuditLogEntry['entityType'] (stylist-svelte) doesn't have 'session_expert'/'report' —
// the DB allows a couple more values than the shared component type does, so fold them onto the
// closest existing label rather than widening the shared type for a display-only field.
const ENTITY_TYPE_MAP: Record<
	WbdAuditLogRow['entity_type'],
	'user' | 'session' | 'question' | 'answer' | 'round' | 'discussion' | 'system'
> = {
	user: 'user',
	session: 'session',
	session_expert: 'session',
	question: 'question',
	answer: 'answer',
	round: 'round',
	discussion: 'discussion',
	report: 'system',
	system: 'system'
};

export function toStructAuditLogEntry(row: WbdAuditLogRow) {
	const metadata = row.metadata_json
		? (JSON.parse(row.metadata_json) as Record<string, unknown>)
		: null;
	const entityLabel =
		metadata && typeof metadata.email === 'string'
			? metadata.email
			: (metadata?.title as string | undefined);

	return {
		id: row.id,
		actorLabel: row.actor_name || row.actor_email || 'System',
		action: row.action,
		entityType: ENTITY_TYPE_MAP[row.entity_type],
		entityLabel,
		createdAt: row.created_at
	};
}
