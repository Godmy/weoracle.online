import type { PageServerLoad } from './$types';
import type { StructWbdSession } from '$stylist/wbd/type/object/session';

export interface ExpertWithToken {
	id: string;
	sessionId?: string;
	email: string;
	name: string;
	alias: string;
	invitedAt: string;
	joinedAt?: string;
	status: 'invited' | 'joined';
	/** Not part of the shared Struct shape — session owners alone get the raw invite token, to copy links. */
	token: string;
}

export const load: PageServerLoad = async ({ parent, fetch, url }) => {
	const { user } = await parent();
	const query = user!.role === 'admin' ? '' : `?created_by=${user!.id}`;
	const sessionsRes = await fetch(`/api/wbd/sessions${query}`);
	const sessions = (await sessionsRes.json()) as StructWbdSession[];
	const requestedSessionId = url.searchParams.get('session');
	const selectedSession =
		sessions.find((session) => session.id === requestedSessionId) ?? sessions[0] ?? null;

	let experts: ExpertWithToken[] = [];
	if (selectedSession) {
		const expertsRes = await fetch(`/api/wbd/sessions/${selectedSession.id}/experts`);
		if (expertsRes.ok) experts = (await expertsRes.json()) as ExpertWithToken[];
	}

	return { sessions, selectedSessionId: selectedSession?.id ?? '', experts };
};
