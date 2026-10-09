import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { StructWbdSession } from '$stylist/wbd/type/object/session';
import type { StructWbdQuestion } from '$stylist/wbd/type/object/question';
import type { StructWbdExpertAnswer } from '$stylist/wbd/type/object/expert-answer';

export interface ExpertWithToken {
	id: string;
	sessionId?: string;
	email: string;
	name: string;
	alias: string;
	invitedAt: string;
	joinedAt?: string;
	status: 'invited' | 'joined';
	/** Not part of the shared Struct shape — session owners alone get the raw invite token. */
	token: string;
}

export interface SessionDetail extends StructWbdSession {
	createdBy: string;
	questions: StructWbdQuestion[];
	experts: ExpertWithToken[];
}

export interface RoundAnswer extends StructWbdExpertAnswer {
	id: string;
	roundNumber: number;
	expertToken: string;
}

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

export interface RoundView {
	session: StructWbdSession;
	questions: StructWbdQuestion[];
	experts: ExpertWithToken[];
	answersByQuestion: Record<string, RoundAnswer[]>;
	snapshotByQuestion: Record<string, Snapshot | undefined>;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/wbd/sessions/${params.id}`);
	if (res.status === 404) error(404, 'Session not found');
	if (!res.ok) error(res.status, 'Could not load session');
	const session = (await res.json()) as SessionDetail;

	let roundView: RoundView | null = null;
	if (session.currentRound > 0) {
		const roundRes = await fetch(
			`/api/wbd/sessions/${params.id}/round-view?round=${session.currentRound}`
		);
		if (roundRes.ok) roundView = (await roundRes.json()) as RoundView;
	}

	return { session, roundView };
};
