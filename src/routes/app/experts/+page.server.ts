import type { PageServerLoad } from './$types';
import type { WbdExpertRow, WbdSessionRow } from '$lib/wbd/types';

export const load: PageServerLoad = async ({ parent, fetch, url }) => {
	const { user } = await parent();
	const query = user!.role === 'admin' ? '' : `?created_by=${user!.id}`;
	const sessionsRes = await fetch(`/api/wbd/sessions${query}`);
	const sessions = (await sessionsRes.json()) as WbdSessionRow[];
	const requestedSessionId = url.searchParams.get('session');
	const selectedSession =
		sessions.find((session) => session.id === requestedSessionId) ?? sessions[0] ?? null;

	let experts: WbdExpertRow[] = [];
	if (selectedSession) {
		const expertsRes = await fetch(`/api/wbd/sessions/${selectedSession.id}/experts`);
		if (expertsRes.ok) experts = (await expertsRes.json()) as WbdExpertRow[];
	}

	return { sessions, selectedSessionId: selectedSession?.id ?? '', experts };
};
