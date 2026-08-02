PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS wbd_users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	company TEXT,
	role TEXT NOT NULL CHECK (role IN ('coordinator', 'expert', 'admin')),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wbd_sessions (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	description TEXT,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (
		status IN ('draft', 'active', 'round_1', 'round_2', 'round_3', 'completed')
	),
	current_round INTEGER NOT NULL DEFAULT 0 CHECK (current_round >= 0),
	max_rounds INTEGER NOT NULL DEFAULT 3 CHECK (max_rounds > 0),
	assumptions TEXT,
	created_by TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	started_at TEXT,
	completed_at TEXT,
	FOREIGN KEY (created_by) REFERENCES wbd_users (id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS wbd_session_experts (
	id TEXT PRIMARY KEY,
	session_id TEXT NOT NULL,
	user_id TEXT NOT NULL,
	token TEXT NOT NULL UNIQUE,
	alias TEXT NOT NULL,
	invited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	joined_at TEXT,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES wbd_users (id) ON DELETE CASCADE,
	UNIQUE (session_id, user_id),
	UNIQUE (session_id, alias)
);

CREATE TABLE IF NOT EXISTS wbd_questions (
	id TEXT PRIMARY KEY,
	session_id TEXT NOT NULL,
	order_index INTEGER NOT NULL CHECK (order_index >= 0),
	category TEXT,
	text TEXT NOT NULL,
	type TEXT NOT NULL CHECK (type IN ('numeric', 'percentage', 'boolean')),
	unit TEXT,
	min_value NUMERIC,
	max_value NUMERIC,
	required INTEGER NOT NULL DEFAULT 1 CHECK (required IN (0, 1)),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE,
	CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value),
	UNIQUE (session_id, order_index)
);

CREATE TABLE IF NOT EXISTS wbd_answers (
	id TEXT PRIMARY KEY,
	question_id TEXT NOT NULL,
	round_number INTEGER NOT NULL CHECK (round_number > 0),
	expert_token TEXT NOT NULL,
	optimistic NUMERIC,
	realistic NUMERIC,
	pessimistic NUMERIC,
	rationale TEXT,
	confidence INTEGER CHECK (confidence IS NULL OR confidence BETWEEN 1 AND 5),
	submitted_at TEXT,
	updated_at TEXT,
	FOREIGN KEY (question_id) REFERENCES wbd_questions (id) ON DELETE CASCADE,
	FOREIGN KEY (expert_token) REFERENCES wbd_session_experts (token) ON DELETE CASCADE,
	UNIQUE (question_id, round_number, expert_token)
);

CREATE TABLE IF NOT EXISTS wbd_discussion_messages (
	id TEXT PRIMARY KEY,
	question_id TEXT NOT NULL,
	round_number INTEGER NOT NULL CHECK (round_number > 0),
	expert_token TEXT NOT NULL,
	alias TEXT NOT NULL,
	message TEXT NOT NULL,
	parent_id TEXT,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (question_id) REFERENCES wbd_questions (id) ON DELETE CASCADE,
	FOREIGN KEY (expert_token) REFERENCES wbd_session_experts (token) ON DELETE CASCADE,
	FOREIGN KEY (parent_id) REFERENCES wbd_discussion_messages (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wbd_round_snapshots (
	id TEXT PRIMARY KEY,
	session_id TEXT NOT NULL,
	round_number INTEGER NOT NULL CHECK (round_number > 0),
	question_id TEXT NOT NULL,
	count_responses INTEGER NOT NULL DEFAULT 0 CHECK (count_responses >= 0),
	median NUMERIC,
	q1 NUMERIC,
	q3 NUMERIC,
	min_value NUMERIC,
	max_value NUMERIC,
	consensus_level TEXT CHECK (
		consensus_level IS NULL OR consensus_level IN ('high', 'medium', 'low')
	),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE,
	FOREIGN KEY (question_id) REFERENCES wbd_questions (id) ON DELETE CASCADE,
	CHECK (q1 IS NULL OR q3 IS NULL OR q1 <= q3),
	CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value),
	UNIQUE (session_id, round_number, question_id)
);

CREATE INDEX IF NOT EXISTS idx_wbd_users_email ON wbd_users (email);
CREATE INDEX IF NOT EXISTS idx_wbd_sessions_created_by ON wbd_sessions (created_by);
CREATE INDEX IF NOT EXISTS idx_wbd_sessions_status ON wbd_sessions (status);
CREATE INDEX IF NOT EXISTS idx_wbd_session_experts_session_id ON wbd_session_experts (session_id);
CREATE INDEX IF NOT EXISTS idx_wbd_session_experts_user_id ON wbd_session_experts (user_id);
CREATE INDEX IF NOT EXISTS idx_wbd_session_experts_token ON wbd_session_experts (token);
CREATE INDEX IF NOT EXISTS idx_wbd_questions_session_id ON wbd_questions (session_id);
CREATE INDEX IF NOT EXISTS idx_wbd_answers_question_round ON wbd_answers (question_id, round_number);
CREATE INDEX IF NOT EXISTS idx_wbd_answers_expert_token ON wbd_answers (expert_token);
CREATE INDEX IF NOT EXISTS idx_wbd_discussion_messages_question_round ON wbd_discussion_messages (question_id, round_number);
CREATE INDEX IF NOT EXISTS idx_wbd_discussion_messages_parent_id ON wbd_discussion_messages (parent_id);
CREATE INDEX IF NOT EXISTS idx_wbd_round_snapshots_session_round ON wbd_round_snapshots (session_id, round_number);
