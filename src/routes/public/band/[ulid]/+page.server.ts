import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { publicExpertCookieName } from '$lib/server/wbd/experts';
import type { WbdAnswerRow, WbdQuestionRow, WbdSessionRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ params, cookies, platform, fetch }) => {
	const db = platform!.env.DB;
	const session = await db
		.prepare(`SELECT id FROM wbd_sessions WHERE id = ?1 AND is_public = 1`)
		.bind(params.ulid)
		.first<{ id: string }>();
	if (!session) error(404, 'This poll is not public or does not exist');

	const token = cookies.get(publicExpertCookieName(params.ulid));
	if (!token) redirect(303, `/public/invite/${params.ulid}`);

	const res = await fetch(`/api/wbd/experts/${token}`);
	if (res.status === 404) redirect(303, `/public/invite/${params.ulid}`);
	if (!res.ok) error(res.status, 'Could not load this poll');

	const body = (await res.json()) as {
		expert: { id: string; alias: string };
		session: WbdSessionRow;
		questions: WbdQuestionRow[];
		answers: WbdAnswerRow[];
	};
	return { token, ...body };
};
