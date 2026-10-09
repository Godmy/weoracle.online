// Raw D1 row shape returned by src/routes/api/wbd/sessions/** (snake_case, matches migrations/0001_wbd_initial_schema.sql).
export interface WbdSessionRow {
	id: string;
	title: string;
	description: string | null;
	image_url: string | null;
	is_public: 0 | 1;
	status: 'draft' | 'active' | 'round_1' | 'round_2' | 'round_3' | 'completed';
	current_round: number;
	max_rounds: number;
	assumptions: string | null;
	created_by: string;
	created_at: string;
	started_at: string | null;
	completed_at: string | null;
	expert_count?: number;
	question_count?: number;
	response_count?: number;
}
