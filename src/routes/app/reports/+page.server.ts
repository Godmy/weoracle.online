import type { PageServerLoad } from './$types';
import { loadReportOverview } from '$lib/server/wbd/admin-overview';

export const load: PageServerLoad = async ({ parent, platform }) => {
	const { user } = await parent();
	const userId = user?.role === 'admin' ? undefined : user?.id;
	const reports = await loadReportOverview(platform!.env.DB, userId);
	return reports;
};
