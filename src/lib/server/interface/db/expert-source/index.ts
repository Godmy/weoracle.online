// Raw D1 row shape for wbd_expert_sources (matches migrations/0009_wbd_agent_panel.sql) — one
// research artifact an agent collected before answering a question. Not read back anywhere yet;
// ManagerAgentPanel only writes placeholder rows until a real research phase lands.
export interface WbdExpertSourceRow {
	id: string;
	session_id: string;
	question_id: string | null;
	expert_token: string;
	round_number: number;
	url: string;
	title: string | null;
	fetched_at: string;
	extracted_value: string | null;
	note: string | null;
}
