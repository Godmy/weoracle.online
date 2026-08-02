import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { WbdExpertRow, WbdQuestionRow, WbdSessionRow, WbdSnapshotRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ params, fetch, parent }) => {
	const { user } = await parent();

	const sessionRes = await fetch(`/api/wbd/sessions/${params.id}`);
	if (sessionRes.status === 404) error(404, 'Session not found');
	if (!sessionRes.ok) error(sessionRes.status, 'Could not load session');
	const session = (await sessionRes.json()) as WbdSessionRow & {
		questions: WbdQuestionRow[];
		experts: WbdExpertRow[];
	};

	const allowed = Boolean(user) && (user!.role === 'admin' || user!.id === session.created_by);
	if (!allowed) {
		return { allowed: false as const, session, snapshots: [] as WbdSnapshotRow[] };
	}

	const snapshotsRes = await fetch(`/api/wbd/sessions/${params.id}/snapshots`);
	if (!snapshotsRes.ok) error(snapshotsRes.status, 'Could not load snapshots');
	const snapshots = (await snapshotsRes.json()) as WbdSnapshotRow[];

	return { allowed: true as const, session, snapshots };
};
