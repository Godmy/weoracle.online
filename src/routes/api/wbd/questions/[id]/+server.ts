import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerQuestion } from '$lib/server/class/manager/question';

export const PATCH: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireQuestionOwner(cookies, db, params.id);

	const rawBody = await request.json().catch(() => null);
	if (!rawBody || typeof rawBody !== 'object') error(400, 'Invalid body');
	const body = rawBody as Record<string, unknown>;

	// The editor sends the nested `media` shape from StructWbdQuestion (or `null` to clear it);
	// normalizePatch only understands flat mediaKind/mediaUrl/... columns.
	if ('media' in body) {
		const media = body.media as
			| { kind?: string; url?: string; caption?: string; requireViewed?: boolean }
			| null
			| undefined;
		body.mediaKind = media?.kind ?? null;
		body.mediaUrl = media?.url ?? null;
		body.mediaCaption = media?.caption ?? null;
		body.mediaRequireViewed = media?.requireViewed ?? false;
	}

	const normalized = ManagerQuestion.normalizePatch(body);
	const rawOptions = body.options;
	const options = Array.isArray(rawOptions)
		? (rawOptions as { label: string; description?: string; image_url?: string; imageUrl?: string }[]).map(
				(option) => ({
					label: option.label,
					description: option.description,
					image_url: option.image_url ?? option.imageUrl
				})
			)
		: undefined;
	const result = await ManagerQuestion.patchAndLoad(db, params.id, normalized, options);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireQuestionOwner(cookies, db, params.id);
	await ManagerQuestion.delete(db, params.id);
	return json({ id: params.id });
};
