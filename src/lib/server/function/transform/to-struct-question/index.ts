import type { WbdQuestionOptionRow, WbdQuestionRow } from '$lib/server/interface/db/question';

export function toStructQuestion(row: WbdQuestionRow, options: WbdQuestionOptionRow[] = []) {
	return {
		id: row.id,
		sessionId: row.session_id,
		orderIndex: row.order_index,
		category: row.category ?? undefined,
		text: row.text,
		helpText: row.help_text ?? undefined,
		type: row.type,
		unit: row.unit ?? undefined,
		minValue: row.min_value ?? undefined,
		maxValue: row.max_value ?? undefined,
		scaleMin: row.scale_min ?? undefined,
		scaleMax: row.scale_max ?? undefined,
		scaleMinLabel: row.scale_min_label ?? undefined,
		scaleMaxLabel: row.scale_max_label ?? undefined,
		media:
			row.media_kind && row.media_url
				? {
						kind: row.media_kind,
						url: row.media_url,
						caption: row.media_caption ?? undefined,
						requireViewed: row.media_require_viewed === 1
					}
				: undefined,
		options: options.length
			? options.map((option) => ({
					id: option.id,
					orderIndex: option.order_index,
					label: option.label,
					description: option.description ?? undefined,
					imageUrl: option.image_url ?? undefined
				}))
			: undefined,
		required: row.required === 1
	};
}
