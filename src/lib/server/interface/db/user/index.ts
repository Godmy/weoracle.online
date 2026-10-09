// Merged shape: both the `wbd_user` session cookie (no created_at) and the D1 `wbd_users` row
// (has created_at) — the two were split before (WbdUser / WbdUserRow) but are structurally the
// same thing at two points in their lifecycle, so `created_at` is simply optional here.
export interface WbdUser {
	id: string;
	email: string;
	name: string;
	company: string | null;
	role: 'coordinator' | 'expert' | 'admin';
	created_at?: string;
	/** 'agent' = one of the six-hat AI panel (see ManagerAgentPanel), not a real human. */
	kind?: 'human' | 'agent';
	agent_hat?: 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue' | null;
}
