// Raw D1 row shape returned by src/routes/api/wbd/sessions/[id]/snapshot(s) (snake_case, matches migrations/0001_wbd_initial_schema.sql).
export interface WbdSnapshotRow {
	id: string;
	session_id: string;
	round_number: number;
	question_id: string;
	count_responses: number;
	median: number | null;
	q1: number | null;
	q3: number | null;
	min_value: number | null;
	max_value: number | null;
	consensus_level: 'high' | 'medium' | 'low' | null;
}
