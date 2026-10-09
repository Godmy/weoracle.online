import type { PageServerLoad } from './$types';
import { ManagerOverview } from '$lib/server/class/manager/overview';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const { user } = await parent();
	const userId = user?.role === 'admin' ? undefined : user?.id;
	const discussions = await ManagerOverview.discussionOverview(platform!.env.DB, userId);
	return { discussions };
};
