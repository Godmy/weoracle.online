import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerSnapshot } from '$lib/server/class/manager/snapshot';

/** All-rounds snapshot history for a session (unlike /snapshot, which is scoped to one ?round=). */
export const GET: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);
	const snapshots = await ManagerSnapshot.listAll(db, params.id);
	return json(snapshots);
};
