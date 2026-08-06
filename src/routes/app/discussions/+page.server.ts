import type { PageServerLoad } from './$types';
import { loadDiscussionOverview } from '$lib/server/wbd/admin-overview';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const { user } = await parent();
	const userId = user?.role === 'admin' ? undefined : user?.id;
	const discussions = await loadDiscussionOverview(platform!.env.DB, userId);
	return { discussions };
};
