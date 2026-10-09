// Raw D1 row shape returned by src/routes/api/wbd/questions/** (snake_case, matches
// migrations/0001_wbd_initial_schema.sql + migrations/0010_wbd_question_answer_types.sql).
export type WbdQuestionType =
	| 'estimate'
	| 'boolean'
	| 'scale'
	| 'single_choice'
	| 'multiple_choice'
	| 'free_text';

export interface WbdQuestionRow {
	id: string;
	session_id: string;
	order_index: number;
	category: string | null;
	text: string;
	help_text: string | null;
	type: WbdQuestionType;
	unit: string | null;
	min_value: number | null;
	max_value: number | null;
	scale_min: number | null;
	scale_max: number | null;
	scale_min_label: string | null;
	scale_max_label: string | null;
	media_kind: 'image' | 'video' | null;
	media_url: string | null;
	media_caption: string | null;
	media_require_viewed: 0 | 1;
	required: 0 | 1;
}

// Raw D1 row shape for migrations/0010_wbd_question_answer_types.sql's wbd_question_options.
export interface WbdQuestionOptionRow {
	id: string;
	question_id: string;
	order_index: number;
	label: string;
	description: string | null;
	image_url: string | null;
}
