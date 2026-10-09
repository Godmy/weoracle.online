import type { WbdUser } from '$lib/server/interface/db/user';

export function toStructUser(row: WbdUser) {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		company: row.company ?? undefined,
		role: row.role,
		createdAt: row.created_at,
		kind: row.kind ?? 'human',
		agentHat: row.agent_hat ?? undefined
	};
}
