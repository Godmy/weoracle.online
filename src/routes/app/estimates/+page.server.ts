import type { PageServerLoad } from './$types';
import { loadEstimateOverview } from '$lib/server/wbd/admin-overview';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const { user } = await parent();
	const userId = user?.role === 'admin' ? undefined : user?.id;
	const estimates = await loadEstimateOverview(platform!.env.DB, userId);
	return { estimates };
};
