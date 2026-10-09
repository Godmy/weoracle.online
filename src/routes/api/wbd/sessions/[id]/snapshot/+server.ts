import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerSnapshot } from '$lib/server/class/manager/snapshot';

export const GET: RequestHandler = async ({ params, url, cookies, platform }) => {
	const round = url.searchParams.get('round');
	if (!round) error(400, 'round query param is required');

	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const snapshots = await ManagerSnapshot.get(db, params.id, round);
	return json(snapshots);
};

/** Computes median/quartile/consensus stats for every question in the session for one round, and stores them. */
export const POST: RequestHandler = async ({ params, request, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const body = await request.json().catch(() => null);
	if (!body || typeof body.round_number !== 'number') {
		error(400, 'round_number is required');
	}

	const snapshots = await ManagerSnapshot.compute(db, params.id, body.round_number);
	return json(snapshots, { status: 201 });
};
