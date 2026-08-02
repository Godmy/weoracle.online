import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mapD1Error } from '$lib/server/wbd/db';

const TYPES = ['numeric', 'percentage', 'boolean'] as const;
const PATCHABLE_COLUMNS = new Set(['text', 'category', 'type', 'unit', 'min_value', 'max_value', 'required']);

// Accepts either snake_case (API convention) or the camelCase fields the stylist-svelte
// question editor sends straight from its StructWbdQuestion state.
function normalizeBody(body: Record<string, unknown>) {
	const map: Record<string, string> = {
		category: 'category',
		text: 'text',
		type: 'type',
		unit: 'unit',
		minValue: 'min_value',
		min_value: 'min_value',
		maxValue: 'max_value',
		max_value: 'max_value',
		required: 'required'
	};
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(body)) {
		const column = map[key];
		if (!column || !PATCHABLE_COLUMNS.has(column)) continue;
		out[column] = column === 'required' ? (value ? 1 : 0) : value;
	}
	return out;
}

export const PATCH: RequestHandler = async ({ params, request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') error(400, 'Invalid body');

	const normalized = normalizeBody(body as Record<string, unknown>);
	if ('type' in normalized && !TYPES.includes(normalized.type as (typeof TYPES)[number])) {
		error(400, `type must be one of ${TYPES.join(', ')}`);
	}

	const entries = Object.entries(normalized);
	if (entries.length === 0) error(400, `No patchable fields provided (${[...PATCHABLE_COLUMNS].join(', ')})`);

	const setClause = entries.map(([key], i) => `${key} = ?${i + 1}`).join(', ');
	const values = entries.map(([, value]) => value);

	const db = platform!.env.DB;
	try {
		const result = await db
			.prepare(`UPDATE wbd_questions SET ${setClause} WHERE id = ?${entries.length + 1} RETURNING *`)
			.bind(...values, params.id)
			.first();
		if (!result) error(404, 'Question not found');
		return json(result);
	} catch (err) {
		const { status, message } = mapD1Error(err);
		error(status, message);
	}
};

export const DELETE: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const result = await db
		.prepare(`DELETE FROM wbd_questions WHERE id = ?1 RETURNING id`)
		.bind(params.id)
		.first();
	if (!result) error(404, 'Question not found');
	return json({ id: params.id });
};
