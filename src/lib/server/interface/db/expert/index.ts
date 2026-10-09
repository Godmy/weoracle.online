// Raw D1 row shape returned by src/routes/api/wbd/experts/** and sessions/[id]/experts (snake_case,
// matches migrations/0001_wbd_initial_schema.sql, joined with wbd_users via EXPERTS_BY_SESSION_SQL).
export interface WbdExpertRow {
	id: string;
	session_id: string;
	user_id: string;
	token: string;
	alias: string;
	invited_at: string;
	joined_at: string | null;
	email: string;
	name: string;
	status: 'invited' | 'joined';
	/** 'agent' = one of the six-hat AI panel (see ManagerAgentPanel), not a real human. */
	expert_kind: 'human' | 'agent';
	agent_hat: 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue' | null;
}
