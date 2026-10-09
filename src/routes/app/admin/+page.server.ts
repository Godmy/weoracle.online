import type { PageServerLoad } from './$types';
import type { StructWbdUser } from '$stylist/wbd/type/object/user';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { isAdmin } = await parent();
	if (!isAdmin) return { users: [] as StructWbdUser[] };

	const res = await fetch('/api/wbd/users');
	const users = res.ok ? ((await res.json()) as StructWbdUser[]) : [];
	return { users };
};
