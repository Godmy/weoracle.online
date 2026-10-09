// Raw D1 row shape returned by src/routes/api/wbd/audit-log (snake_case, matches migrations/0002_wbd_platform_tables.sql,
// left-joined with wbd_users for actor_name/actor_email).
export interface WbdAuditLogRow {
	id: string;
	actor_user_id: string | null;
	session_id: string | null;
	action: string;
	entity_type:
		| 'user'
		| 'session'
		| 'session_expert'
		| 'question'
		| 'answer'
		| 'round'
		| 'discussion'
		| 'report'
		| 'system';
	entity_id: string | null;
	metadata_json: string | null;
	created_at: string;
	actor_name?: string | null;
	actor_email?: string | null;
}
