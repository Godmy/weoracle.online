CREATE TABLE IF NOT EXISTS wbd_applications (
	id TEXT PRIMARY KEY,
	request_type TEXT NOT NULL CHECK (request_type IN ('public-poll', 'private-session', 'enterprise-setup')),
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	company TEXT,
	message TEXT NOT NULL,
	email_sent INTEGER NOT NULL DEFAULT 0 CHECK (email_sent IN (0, 1)),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wbd_applications_created_at ON wbd_applications (created_at);
