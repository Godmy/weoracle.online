import type { PageServerLoad } from './$types';
import type { WbdSessionRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { user } = await parent();
	const res = await fetch(`/api/wbd/sessions?created_by=${user!.id}`);
	const sessions = (await res.json()) as WbdSessionRow[];
	return { sessions };
};
