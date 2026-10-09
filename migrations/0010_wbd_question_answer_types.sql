PRAGMA foreign_keys = OFF;

CREATE TABLE wbd_questions_new (
	id TEXT PRIMARY KEY,
	session_id TEXT NOT NULL,
	order_index INTEGER NOT NULL CHECK (order_index >= 0),
	category TEXT,
	text TEXT NOT NULL,
	type TEXT NOT NULL CHECK (
		type IN ('estimate', 'boolean', 'scale', 'single_choice', 'multiple_choice', 'free_text')
	),
	unit TEXT,
	min_value NUMERIC,
	max_value NUMERIC,
	scale_min NUMERIC,
	scale_max NUMERIC,
	scale_min_label TEXT,
	scale_max_label TEXT,
	media_kind TEXT CHECK (media_kind IS NULL OR media_kind IN ('image', 'video')),
	media_url TEXT,
	media_caption TEXT,
	media_require_viewed INTEGER NOT NULL DEFAULT 0 CHECK (media_require_viewed IN (0, 1)),
	required INTEGER NOT NULL DEFAULT 1 CHECK (required IN (0, 1)),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE,
	CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value),
	CHECK (scale_min IS NULL OR scale_max IS NULL OR scale_min <= scale_max),
	CHECK (media_url IS NOT NULL OR media_kind IS NULL),
	UNIQUE (session_id, order_index)
);

INSERT INTO wbd_questions_new (
	id, session_id, order_index, category, text, type, unit, min_value, max_value, required, created_at
)
SELECT
	id, session_id, order_index, category, text,
	CASE WHEN type IN ('numeric', 'percentage') THEN 'estimate' ELSE type END,
	unit, min_value, max_value, required, created_at
FROM wbd_questions;

DROP TABLE wbd_questions;
ALTER TABLE wbd_questions_new RENAME TO wbd_questions;

CREATE INDEX IF NOT EXISTS idx_wbd_questions_session_id ON wbd_questions (session_id);

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS wbd_question_options (
	id TEXT PRIMARY KEY,
	question_id TEXT NOT NULL,
	order_index INTEGER NOT NULL CHECK (order_index >= 0),
	label TEXT NOT NULL,
	description TEXT,
	image_url TEXT,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (question_id) REFERENCES wbd_questions (id) ON DELETE CASCADE,
	UNIQUE (question_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_wbd_question_options_question_id ON wbd_question_options (question_id);

ALTER TABLE wbd_answers ADD COLUMN value TEXT;
