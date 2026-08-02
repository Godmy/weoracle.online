import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { WbdAnswerRow, WbdQuestionRow, WbdSessionRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/wbd/experts/${params.token}`);
	if (res.status === 404) error(404, 'Invalid or expired invite link');
	if (!res.ok) error(res.status, 'Could not load your invite');

	const body = (await res.json()) as {
		expert: { id: string; alias: string };
		session: WbdSessionRow;
		questions: WbdQuestionRow[];
		answers: WbdAnswerRow[];
	};
	return { token: params.token, ...body };
};
