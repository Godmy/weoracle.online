import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerSnapshot } from '$lib/server/class/manager/snapshot';

export const GET: RequestHandler = async ({ params, url, cookies, platform }) => {
	const round = url.searchParams.get('round');
	if (!round) error(400, 'round query param is required');

	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const roundView = await ManagerSnapshot.getRoundView(db, params.id, round);
	return json(roundView);
};
