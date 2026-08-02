import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { WbdExpertRow, WbdQuestionRow, WbdRoundView, WbdSessionRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/wbd/sessions/${params.id}`);
	if (res.status === 404) error(404, 'Session not found');
	if (!res.ok) error(res.status, 'Could not load session');
	const session = (await res.json()) as WbdSessionRow & { questions: WbdQuestionRow[]; experts: WbdExpertRow[] };

	let roundView: WbdRoundView | null = null;
	if (session.current_round > 0) {
		const roundRes = await fetch(`/api/wbd/sessions/${params.id}/round-view?round=${session.current_round}`);
		if (roundRes.ok) roundView = (await roundRes.json()) as WbdRoundView;
	}

	return { session, roundView };
};
