PRAGMA foreign_keys = ON;

-- Marks a user/session-expert row as an AI agent (one of the six-hat panel) instead of a real
-- human. See docs/chat/20260817/002-CLAUDE-METHODOLOGY.md for the methodology this backs.
ALTER TABLE wbd_users ADD COLUMN kind TEXT NOT NULL DEFAULT 'human' CHECK (kind IN ('human', 'agent'));
ALTER TABLE wbd_users ADD COLUMN agent_hat TEXT CHECK (
	agent_hat IS NULL OR agent_hat IN ('white', 'red', 'black', 'yellow', 'green', 'blue')
);

-- Mirrored onto wbd_session_experts so reads that only join through EXPERTS_BY_SESSION_SQL don't
-- need a second join back to wbd_users just to tell bot from human.
ALTER TABLE wbd_session_experts ADD COLUMN expert_kind TEXT NOT NULL DEFAULT 'human' CHECK (expert_kind IN ('human', 'agent'));
ALTER TABLE wbd_session_experts ADD COLUMN agent_hat TEXT CHECK (
	agent_hat IS NULL OR agent_hat IN ('white', 'red', 'black', 'yellow', 'green', 'blue')
);

-- Research artifacts an agent collected before answering — url/title/extracted_value give every
-- agent rationale a traceable source instead of an unsupported number. Not yet populated with real
-- fetches (see ManagerAgentPanel mock estimate); the table exists so the real research phase has
-- somewhere to write without another migration.
CREATE TABLE IF NOT EXISTS wbd_expert_sources (
	id TEXT PRIMARY KEY,
	session_id TEXT NOT NULL,
	question_id TEXT,
	expert_token TEXT NOT NULL,
	round_number INTEGER NOT NULL CHECK (round_number > 0),
	url TEXT NOT NULL,
	title TEXT,
	fetched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	extracted_value TEXT,
	note TEXT,
	FOREIGN KEY (session_id) REFERENCES wbd_sessions (id) ON DELETE CASCADE,
	FOREIGN KEY (question_id) REFERENCES wbd_questions (id) ON DELETE CASCADE,
	FOREIGN KEY (expert_token) REFERENCES wbd_session_experts (token) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wbd_users_kind ON wbd_users (kind);
CREATE INDEX IF NOT EXISTS idx_wbd_session_experts_expert_kind ON wbd_session_experts (session_id, expert_kind);
CREATE INDEX IF NOT EXISTS idx_wbd_expert_sources_session ON wbd_expert_sources (session_id);
CREATE INDEX IF NOT EXISTS idx_wbd_expert_sources_question ON wbd_expert_sources (question_id);
CREATE INDEX IF NOT EXISTS idx_wbd_expert_sources_expert ON wbd_expert_sources (expert_token);
