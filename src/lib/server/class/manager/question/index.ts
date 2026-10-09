import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type {
	WbdQuestionOptionRow,
	WbdQuestionRow,
	WbdQuestionType
} from '$lib/server/interface/db/question';
import { generateId } from '$lib/server/function/generate/id';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';
import { toStructQuestion } from '$lib/server/function/transform/to-struct-question';

const TYPES: readonly WbdQuestionType[] = [
	'estimate',
	'boolean',
	'scale',
	'single_choice',
	'multiple_choice',
	'free_text'
];
const OPTION_TYPES: readonly WbdQuestionType[] = ['single_choice', 'multiple_choice'];
const PATCHABLE_COLUMNS = new Set([
	'text',
	'help_text',
	'category',
	'type',
	'unit',
	'min_value',
	'max_value',
	'scale_min',
	'scale_max',
	'scale_min_label',
	'scale_max_label',
	'media_kind',
	'media_url',
	'media_caption',
	'media_require_viewed',
	'required'
]);

export interface CreateQuestionOptionInput {
	label: string;
	description?: string;
	image_url?: string;
}

export interface CreateQuestionInput {
	text: string;
	type: string;
	help_text?: string;
	category?: string;
	unit?: string;
	min_value?: number;
	max_value?: number;
	scale_min?: number;
	scale_max?: number;
	scale_min_label?: string;
	scale_max_label?: string;
	media_kind?: 'image' | 'video';
	media_url?: string;
	media_caption?: string;
	media_require_viewed?: boolean;
	required?: boolean;
	options?: CreateQuestionOptionInput[];
}

export class ManagerQuestion {
	static async listForSession(db: D1Like, sessionId: string) {
		const { results } = await db
			.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
			.bind(sessionId)
			.all<WbdQuestionRow>();
		if (results.length === 0) return [];

		const { results: optionRows } = await db
			.prepare(
				`SELECT * FROM wbd_question_options WHERE question_id IN (${results
					.map((_, i) => `?${i + 1}`)
					.join(', ')}) ORDER BY order_index`
			)
			.bind(...results.map((row) => row.id))
			.all<WbdQuestionOptionRow>();

		return results.map((row) =>
			toStructQuestion(
				row,
				optionRows.filter((option) => option.question_id === row.id)
			)
		);
	}

	static async create(db: D1Like, sessionId: string, input: CreateQuestionInput) {
		if (!TYPES.includes(input.type as WbdQuestionType)) {
			error(400, `type must be one of ${TYPES.join(', ')}`);
		}

		try {
			const nextOrder = await db
				.prepare(
					`SELECT COALESCE(MAX(order_index) + 1, 0) AS next FROM wbd_questions WHERE session_id = ?1`
				)
				.bind(sessionId)
				.first<{ next: number }>();

			const questionId = generateId();
			const result = await db
				.prepare(
					`INSERT INTO wbd_questions
					 (id, session_id, order_index, category, text, help_text, type, unit, min_value, max_value,
					  scale_min, scale_max, scale_min_label, scale_max_label,
					  media_kind, media_url, media_caption, media_require_viewed, required)
					 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
					 RETURNING *`
				)
				.bind(
					questionId,
					sessionId,
					nextOrder!.next,
					input.category ?? null,
					input.text,
					input.help_text ?? null,
					input.type,
					input.unit ?? null,
					input.min_value ?? null,
					input.max_value ?? null,
					input.scale_min ?? null,
					input.scale_max ?? null,
					input.scale_min_label ?? null,
					input.scale_max_label ?? null,
					input.media_kind ?? null,
					input.media_url ?? null,
					input.media_caption ?? null,
					input.media_require_viewed ? 1 : 0,
					input.required === false ? 0 : 1
				)
				.first<WbdQuestionRow>();
			if (!result) return result;

			const options =
				OPTION_TYPES.includes(input.type as WbdQuestionType) && input.options
					? await ManagerQuestion.replaceOptions(db, questionId, input.options)
					: [];
			return toStructQuestion(result, options);
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}

	/** Accepts either snake_case (API convention) or the camelCase fields the stylist-svelte question editor sends. */
	static normalizePatch(body: Record<string, unknown>): Record<string, unknown> {
		const map: Record<string, string> = {
			category: 'category',
			text: 'text',
			helpText: 'help_text',
			help_text: 'help_text',
			type: 'type',
			unit: 'unit',
			minValue: 'min_value',
			min_value: 'min_value',
			maxValue: 'max_value',
			max_value: 'max_value',
			scaleMin: 'scale_min',
			scale_min: 'scale_min',
			scaleMax: 'scale_max',
			scale_max: 'scale_max',
			scaleMinLabel: 'scale_min_label',
			scale_min_label: 'scale_min_label',
			scaleMaxLabel: 'scale_max_label',
			scale_max_label: 'scale_max_label',
			mediaKind: 'media_kind',
			media_kind: 'media_kind',
			mediaUrl: 'media_url',
			media_url: 'media_url',
			mediaCaption: 'media_caption',
			media_caption: 'media_caption',
			mediaRequireViewed: 'media_require_viewed',
			media_require_viewed: 'media_require_viewed',
			required: 'required'
		};
		const boolColumns = new Set(['required', 'media_require_viewed']);
		const out: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(body)) {
			const column = map[key];
			if (!column || !PATCHABLE_COLUMNS.has(column)) continue;
			out[column] = boolColumns.has(column) ? (value ? 1 : 0) : value;
		}
		return out;
	}

	/** Full replace of a question's option set — pass `options` (camelCase or snake_case) on a PATCH body to update it. */
	static async replaceOptions(
		db: D1Like,
		questionId: string,
		options: CreateQuestionOptionInput[]
	): Promise<WbdQuestionOptionRow[]> {
		await db.prepare(`DELETE FROM wbd_question_options WHERE question_id = ?1`).bind(questionId).run();
		const rows: WbdQuestionOptionRow[] = [];
		for (const [index, option] of options.entries()) {
			const row = await db
				.prepare(
					`INSERT INTO wbd_question_options (id, question_id, order_index, label, description, image_url)
					 VALUES (?1, ?2, ?3, ?4, ?5, ?6)
					 RETURNING *`
				)
				.bind(
					generateId(),
					questionId,
					index,
					option.label,
					option.description ?? null,
					option.image_url ?? null
				)
				.first<WbdQuestionOptionRow>();
			if (row) rows.push(row);
		}
		return rows;
	}

	static async update(db: D1Like, questionId: string, patch: Record<string, unknown>) {
		if ('type' in patch && !TYPES.includes(patch.type as WbdQuestionType)) {
			error(400, `type must be one of ${TYPES.join(', ')}`);
		}

		const entries = Object.entries(patch);
		if (entries.length === 0)
			error(400, `No patchable fields provided (${[...PATCHABLE_COLUMNS].join(', ')})`);

		const setClause = entries.map(([key], i) => `${key} = ?${i + 1}`).join(', ');
		const values = entries.map(([, value]) => value);

		try {
			const result = await db
				.prepare(
					`UPDATE wbd_questions SET ${setClause} WHERE id = ?${entries.length + 1} RETURNING *`
				)
				.bind(...values, questionId)
				.first<WbdQuestionRow>();
			if (!result) error(404, 'Question not found');
			return { row: result };
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}

	/** Applies a question PATCH, optionally replacing its options in the same call, and returns the full struct. */
	static async patchAndLoad(
		db: D1Like,
		questionId: string,
		patch: Record<string, unknown>,
		options?: CreateQuestionOptionInput[]
	) {
		const updated =
			Object.keys(patch).length > 0
				? await ManagerQuestion.update(db, questionId, patch)
				: undefined;
		const row =
			updated?.row ??
			(await db
				.prepare(`SELECT * FROM wbd_questions WHERE id = ?1`)
				.bind(questionId)
				.first<WbdQuestionRow>());
		if (!row) error(404, 'Question not found');

		const type = row.type;
		let optionRows: WbdQuestionOptionRow[];
		if (!OPTION_TYPES.includes(type)) {
			// Switching away from single/multiple choice — drop any leftover options rather than
			// leaving them orphaned (they'd otherwise resurface if the type is switched back later).
			await db.prepare(`DELETE FROM wbd_question_options WHERE question_id = ?1`).bind(questionId).run();
			optionRows = [];
		} else if (options) {
			optionRows = await ManagerQuestion.replaceOptions(db, questionId, options);
		} else {
			optionRows = (
				await db
					.prepare(`SELECT * FROM wbd_question_options WHERE question_id = ?1 ORDER BY order_index`)
					.bind(questionId)
					.all<WbdQuestionOptionRow>()
			).results;
		}

		return toStructQuestion(row, optionRows);
	}

	static async delete(db: D1Like, questionId: string): Promise<void> {
		const result = await db
			.prepare(`DELETE FROM wbd_questions WHERE id = ?1 RETURNING id`)
			.bind(questionId)
			.first();
		if (!result) error(404, 'Question not found');
	}
}
