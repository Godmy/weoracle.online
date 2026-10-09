import type { WbdExpertRow } from '$lib/server/interface/db/expert';

export function toStructExpert(row: WbdExpertRow) {
	return {
		id: row.id,
		sessionId: row.session_id,
		email: row.email,
		name: row.name,
		alias: row.alias,
		invitedAt: row.invited_at,
		joinedAt: row.joined_at ?? undefined,
		status: row.status,
		kind: row.expert_kind,
		agentHat: row.agent_hat ?? undefined
	};
}
