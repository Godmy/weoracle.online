// Raw D1 row shape returned by src/routes/api/wbd/questions/[id]/discussion (snake_case, matches migrations/0001_wbd_initial_schema.sql).
export interface WbdDiscussionMessageRow {
	id: string;
	question_id: string;
	round_number: number;
	expert_token: string;
	alias: string;
	message: string;
	parent_id: string | null;
	created_at: string;
}
