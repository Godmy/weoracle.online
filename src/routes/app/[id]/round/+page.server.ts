import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { StructWbdSession } from '$stylist/wbd/type/object/session';
import type { RoundView } from '../+page.server';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const sessionRes = await fetch(`/api/wbd/sessions/${params.id}`);
	if (sessionRes.status === 404) error(404, 'Session not found');
	if (!sessionRes.ok) error(sessionRes.status, 'Could not load session');
	const session = (await sessionRes.json()) as StructWbdSession;

	const round = Number(url.searchParams.get('round') ?? session.currentRound);
	if (!round || round < 1) error(400, 'This session has no rounds yet');

	const roundRes = await fetch(`/api/wbd/sessions/${params.id}/round-view?round=${round}`);
	if (!roundRes.ok) error(roundRes.status, 'Could not load round data');
	const roundView = (await roundRes.json()) as RoundView;

	return { round, roundView, maxRound: session.currentRound };
};
