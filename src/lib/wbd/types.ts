// Raw D1 row shapes returned by src/routes/api/wbd/** (snake_case, matches migrations/0001_wbd_initial_schema.sql).

export interface WbdSessionRow {
	id: string;
	title: string;
	description: string | null;
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

export interface WbdQuestionRow {
	id: string;
	session_id: string;
	order_index: number;
	category: string | null;
	text: string;
	type: 'numeric' | 'percentage' | 'boolean';
	unit: string | null;
	min_value: number | null;
	max_value: number | null;
	required: 0 | 1;
}

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
}

export interface WbdAnswerRow {
	id: string;
	question_id: string;
	round_number: number;
	expert_token: string;
	optimistic: number | null;
	realistic: number | null;
	pessimistic: number | null;
	rationale: string | null;
	confidence: number | null;
	submitted_at: string | null;
	updated_at: string | null;
}

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

export interface WbdRoundView {
	session: WbdSessionRow;
	questions: WbdQuestionRow[];
	experts: WbdExpertRow[];
	answersByQuestion: Record<string, WbdAnswerRow[]>;
	snapshotByQuestion: Record<string, WbdSnapshotRow | undefined>;
}

export interface WbdUser {
	id: string;
	email: string;
	name: string;
	company: string | null;
	role: 'coordinator' | 'expert' | 'admin';
}
