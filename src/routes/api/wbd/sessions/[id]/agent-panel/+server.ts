import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerAuditLog } from '$lib/server/class/manager/audit-log';
import { ManagerAgentPanel } from '$lib/server/class/manager/agent-panel';

/**
 * Registers the six-hat AI panel on this session (if not already present) and runs one round of
 * mock research + answers + Blue Hat synthesis for the session's current round. See
 * `ManagerAgentPanel` — this is currently a placeholder, not a real LLM/web-search call.
 */
export const POST: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	const actor = await ManagerAuth.requireSessionOwner(cookies, db, params.id);

	const result = await ManagerAgentPanel.runRound(db, params.id);

	await ManagerAuditLog.record(db, {
		actorUserId: actor.id,
		sessionId: params.id,
		action: 'agent_panel_run',
		entityType: 'system',
		entityId: params.id,
		metadata: {
			mock: true,
			roundNumber: result.roundNumber,
			answersWritten: result.answersWritten,
			discussionMessagesWritten: result.discussionMessagesWritten
		}
	});

	return json(result, { status: 201 });
};
