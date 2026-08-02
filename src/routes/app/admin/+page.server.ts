import type { PageServerLoad } from './$types';
import type { WbdUserRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { isAdmin } = await parent();
	if (!isAdmin) return { users: [] as WbdUserRow[] };

	const res = await fetch('/api/wbd/users');
	const users = res.ok ? ((await res.json()) as WbdUserRow[]) : [];
	return { users };
};
