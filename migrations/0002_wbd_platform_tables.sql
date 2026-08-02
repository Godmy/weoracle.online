PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS wbd_round_settings (
	id TEXT PRIMARY KEY,
	session_id TEXT NOT NULL,
	round_number INTEGER NOT NULL CHECK (round_number > 0),
	status TEXT NOT NULL DEFAULT 'draft' CHECK (
		status IN ('draft', 'scheduled', 'active', 'closed', 'results_revealed')
	),
	starts_at TEXT,
	deadline_at TEXT,
	closed_at TEXT,
	results_revealed_at TEXT,
	instructions TEXT,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE,
	CHECK (starts_at IS NULL OR deadline_at IS NULL OR starts_at <= deadline_at),
	UNIQUE (session_id, round_number)
);

CREATE TABLE IF NOT EXISTS wbd_final_reports (
	id TEXT PRIMARY KEY,
	session_id TEXT NOT NULL,
	title TEXT NOT NULL,
	summary TEXT,
	content_json TEXT NOT NULL,
	format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'markdown', 'html', 'pdf')),
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
	created_by TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	published_at TEXT,
	archived_at TEXT,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE,
	FOREIGN KEY (created_by) REFERENCES wbd_users (id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS wbd_audit_log (
	id TEXT PRIMARY KEY,
	actor_user_id TEXT,
	session_id TEXT,
	action TEXT NOT NULL,
	entity_type TEXT NOT NULL CHECK (
		entity_type IN ('user', 'session', 'session_expert', 'question', 'answer', 'round', 'discussion', 'report', 'system')
	),
	entity_id TEXT,
	metadata_json TEXT,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (actor_user_id) REFERENCES wbd_users (id) ON DELETE SET NULL,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wbd_round_settings_session_round ON wbd_round_settings (session_id, round_number);
CREATE INDEX IF NOT EXISTS idx_wbd_round_settings_status ON wbd_round_settings (status);
CREATE INDEX IF NOT EXISTS idx_wbd_final_reports_session_id ON wbd_final_reports (session_id);
CREATE INDEX IF NOT EXISTS idx_wbd_final_reports_status ON wbd_final_reports (status);
CREATE INDEX IF NOT EXISTS idx_wbd_audit_log_actor_user_id ON wbd_audit_log (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_wbd_audit_log_session_created ON wbd_audit_log (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_wbd_audit_log_entity ON wbd_audit_log (entity_type, entity_id);
