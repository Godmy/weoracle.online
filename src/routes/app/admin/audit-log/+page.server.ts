import type { PageServerLoad } from './$types';
import type { WbdAuditLogRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { isAdmin } = await parent();
	if (!isAdmin) return { entries: [] as WbdAuditLogRow[] };

	const res = await fetch('/api/wbd/audit-log');
	const entries = res.ok ? ((await res.json()) as WbdAuditLogRow[]) : [];
	return { entries };
};
