// Raw D1 row shape returned by src/routes/api/wbd/questions/[id]/answers (snake_case, matches migrations/0001_wbd_initial_schema.sql).
export interface WbdAnswerRow {
	id: string;
	question_id: string;
	round_number: number;
	expert_token: string;
	optimistic: number | null;
	realistic: number | null;
	pessimistic: number | null;
	value: string | null;
	rationale: string | null;
	confidence: number | null;
	submitted_at: string | null;
	updated_at: string | null;
}
