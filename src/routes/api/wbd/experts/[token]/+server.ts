import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerExpert } from '$lib/server/class/manager/expert';

/** Resolves an expert's invite token into their session view, and stamps joined_at on first visit. */
export const GET: RequestHandler = async ({ params, platform }) => {
	const db = platform!.env.DB;
	const result = await ManagerExpert.resolveByToken(db, params.token);
	return json(result);
};
