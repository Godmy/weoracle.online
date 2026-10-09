import type { PageServerLoad } from './$types';

export interface AuditLogEntry {
	id: string;
	actorLabel: string;
	action: string;
	entityType: 'user' | 'session' | 'question' | 'answer' | 'round' | 'discussion' | 'system';
	entityLabel?: string;
	createdAt: string;
}

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { isAdmin } = await parent();
	if (!isAdmin) return { entries: [] as AuditLogEntry[] };

	const res = await fetch('/api/wbd/audit-log');
	const entries = res.ok ? ((await res.json()) as AuditLogEntry[]) : [];
	return { entries };
};
