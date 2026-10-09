import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { StructWbdSession } from '$stylist/wbd/type/object/session';
import type { StructWbdQuestion } from '$stylist/wbd/type/object/question';

export interface Snapshot {
	id: string;
	sessionId: string;
	roundNumber: number;
	questionId: string;
	countResponses: number;
	median?: number;
	q1?: number;
	q3?: number;
	minValue?: number;
	maxValue?: number;
	consensusLevel?: 'high' | 'medium' | 'low';
}

interface SessionWithQuestions extends StructWbdSession {
	createdBy: string;
	questions: StructWbdQuestion[];
}

export const load: PageServerLoad = async ({ params, fetch, parent }) => {
	const { user } = await parent();

	const sessionRes = await fetch(`/api/wbd/sessions/${params.id}`);
	if (sessionRes.status === 404) error(404, 'Session not found');
	if (!sessionRes.ok) error(sessionRes.status, 'Could not load session');
	const session = (await sessionRes.json()) as SessionWithQuestions;

	const allowed = Boolean(user) && (user!.role === 'admin' || user!.id === session.createdBy);
	if (!allowed) {
		return { allowed: false as const, session, snapshots: [] as Snapshot[] };
	}

	const snapshotsRes = await fetch(`/api/wbd/sessions/${params.id}/snapshots`);
	if (!snapshotsRes.ok) error(snapshotsRes.status, 'Could not load snapshots');
	const snapshots = (await snapshotsRes.json()) as Snapshot[];

	return { allowed: true as const, session, snapshots };
};
