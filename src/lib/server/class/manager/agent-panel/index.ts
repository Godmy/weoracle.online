import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import type { WbdSessionRow } from '$lib/server/interface/db/session';
import type { WbdQuestionRow } from '$lib/server/interface/db/question';
import { AGENT_HATS, AGENT_HAT_META, type AgentHat } from '$lib/server/const/value/agent-hats';
import { generateId } from '$lib/server/function/generate/id';
import { nowIso } from '$lib/server/function/time/now-iso';
import { toStructSnapshot } from '$lib/server/function/transform/to-struct-snapshot';
import { ManagerAnswer } from '$lib/server/class/manager/answer';
import { ManagerDiscussion } from '$lib/server/class/manager/discussion';
import { ManagerSnapshot } from '$lib/server/class/manager/snapshot';

export interface AgentPanelExpert {
	hat: AgentHat;
	token: string;
	alias: string;
}

export interface AgentPanelRunResult {
	roundNumber: number;
	agentsEnsured: number;
	answersWritten: number;
	sourcesWritten: number;
	discussionMessagesWritten: number;
	snapshots: ReturnType<typeof toStructSnapshot>[];
}

interface MockEstimate {
	optimistic: number;
	realistic: number;
	pessimistic: number;
	confidence: number;
	rationale: string;
}

/** Deterministic pseudo-random ratio in [0, 1) from a string seed (FNV-1a) — same input always
 * produces the same mock estimate, so re-running a round doesn't make numbers drift for no reason. */
function seededRatio(seed: string): number {
	let hash = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967296;
}

function clampConfidence(value: number): number {
	return Math.min(5, Math.max(1, Math.round(value)));
}

function formatStat(value: number | undefined): string {
	return value == null ? 'н/д' : value.toFixed(2);
}

/**
 * Orchestrates the six-hat AI panel described in docs/chat/20260817/002-CLAUDE-METHODOLOGY.md:
 * White/Red/Black/Yellow/Green submit numeric estimates, Blue Hat synthesizes the round into a
 * discussion message. This is currently a MOCK — `mockEstimate` fabricates plausible numbers from
 * the question's own [min_value, max_value] instead of doing real web research + an LLM call, and
 * every rationale/source it writes says so explicitly. Swap `mockEstimate`/`buildBlueSynthesis` for
 * real calls once an LLM provider is wired in; the DB writes (wbd_answers, wbd_expert_sources,
 * wbd_discussion_messages) and the six-expert bookkeeping stay the same either way.
 */
export class ManagerAgentPanel {
	/** Get-or-creates the six agent users and their session-expert rows for this session. Reusing the
	 * same six wbd_users (one per hat, keyed by a fixed email) across every session keeps the panel
	 * from spawning duplicate "AI · White Hat" identities each time it's run. */
	static async ensureAgents(db: D1Like, sessionId: string): Promise<AgentPanelExpert[]> {
		const agents: AgentPanelExpert[] = [];

		for (const hat of AGENT_HATS) {
			const meta = AGENT_HAT_META[hat];

			const user = await db
				.prepare(
					`INSERT INTO wbd_users (id, email, name, role, kind, agent_hat)
					 VALUES (?1, ?2, ?3, 'expert', 'agent', ?4)
					 ON CONFLICT(email) DO UPDATE SET name = excluded.name
					 RETURNING id`
				)
				.bind(generateId(), meta.email, meta.alias, hat)
				.first<{ id: string }>();

			let sessionExpert = await db
				.prepare(
					`SELECT token, alias FROM wbd_session_experts WHERE session_id = ?1 AND user_id = ?2`
				)
				.bind(sessionId, user!.id)
				.first<{ token: string; alias: string }>();

			if (!sessionExpert) {
				sessionExpert = await db
					.prepare(
						`INSERT INTO wbd_session_experts
						 (id, session_id, user_id, token, alias, joined_at, expert_kind, agent_hat)
						 VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'agent', ?7)
						 RETURNING token, alias`
					)
					.bind(generateId(), sessionId, user!.id, generateId(), meta.alias, nowIso(), hat)
					.first<{ token: string; alias: string }>();
			}

			agents.push({ hat, token: sessionExpert!.token, alias: sessionExpert!.alias });
		}

		return agents;
	}

	/** Runs one round for the AI panel: ensures the six agents exist, has White/Red/Black/Yellow/Green
	 * write a placeholder source + submit a mock answer per question, computes the round snapshot, then
	 * has Blue Hat post one synthesis message per question. Targets the session's *current* round —
	 * the session must already have an open round (not 'draft'/'completed'). */
	static async runRound(db: D1Like, sessionId: string): Promise<AgentPanelRunResult> {
		const session = await db
			.prepare(`SELECT * FROM wbd_sessions WHERE id = ?1`)
			.bind(sessionId)
			.first<WbdSessionRow>();
		if (!session) error(404, 'Session not found');
		if (session.status === 'draft') {
			error(400, 'Session has no open round yet — start round 1 first.');
		}
		if (session.status === 'completed') {
			error(400, 'Session is already completed.');
		}

		const roundNumber = session.current_round;

		const { results: questions } = await db
			.prepare(`SELECT * FROM wbd_questions WHERE session_id = ?1 ORDER BY order_index`)
			.bind(sessionId)
			.all<WbdQuestionRow>();
		if (questions.length === 0) error(400, 'Session has no questions yet.');

		const agents = await ManagerAgentPanel.ensureAgents(db, sessionId);
		const contentAgents = agents.filter((agent) => agent.hat !== 'blue');
		const blueAgent = agents.find((agent) => agent.hat === 'blue')!;

		let answersWritten = 0;
		let sourcesWritten = 0;
		const rationalesByQuestion = new Map<string, { hat: AgentHat; rationale: string }[]>();

		for (const question of questions) {
			const rationales: { hat: AgentHat; rationale: string }[] = [];
			rationalesByQuestion.set(question.id, rationales);

			for (const agent of contentAgents) {
				const estimate = ManagerAgentPanel.mockEstimate(question, agent.hat, roundNumber);
				const meta = AGENT_HAT_META[agent.hat];

				await db
					.prepare(
						`INSERT INTO wbd_expert_sources
						 (id, session_id, question_id, expert_token, round_number, url, title, note)
						 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
					)
					.bind(
						generateId(),
						sessionId,
						question.id,
						agent.token,
						roundNumber,
						'mock://no-web-search-yet',
						`[MOCK] ${meta.label}: источник-заглушка`,
						'Веб-поиск ещё не подключён — таблица готова принять реальные источники после интеграции LLM.'
					)
					.run();
				sourcesWritten += 1;

				await ManagerAnswer.submit(db, question.id, {
					round_number: roundNumber,
					expert_token: agent.token,
					optimistic: estimate.optimistic,
					realistic: estimate.realistic,
					pessimistic: estimate.pessimistic,
					confidence: estimate.confidence,
					rationale: estimate.rationale
				});
				answersWritten += 1;
				rationales.push({ hat: agent.hat, rationale: estimate.rationale });
			}
		}

		const snapshots = await ManagerSnapshot.compute(db, sessionId, roundNumber);
		const snapshotByQuestion = new Map(
			snapshots.map((snapshot) => [snapshot.questionId, snapshot])
		);

		let discussionMessagesWritten = 0;
		for (const question of questions) {
			const snapshot = snapshotByQuestion.get(question.id);
			const rationales = rationalesByQuestion.get(question.id) ?? [];
			const message = ManagerAgentPanel.buildBlueSynthesis(question, snapshot, rationales);

			await ManagerDiscussion.post(db, question.id, {
				round_number: roundNumber,
				expert_token: blueAgent.token,
				message
			});
			discussionMessagesWritten += 1;
		}

		return {
			roundNumber,
			agentsEnsured: agents.length,
			answersWritten,
			sourcesWritten,
			discussionMessagesWritten,
			snapshots
		};
	}

	/** Placeholder estimate derived from the question's own range — NOT a real analysis. See the class
	 * doc comment: this is what gets replaced when a real LLM + web search provider is wired in. */
	private static mockEstimate(
		question: WbdQuestionRow,
		hat: AgentHat,
		roundNumber: number
	): MockEstimate {
		const meta = AGENT_HAT_META[hat];
		const jitter = (seededRatio(`${question.id}:${hat}:${roundNumber}`) - 0.5) * 0.1;
		const ratio = Math.min(1, Math.max(0, meta.position + jitter));
		const confidence = clampConfidence(meta.confidenceBase + jitter * 6);
		const disclaimer = `Значение — плейсхолдер на основе диапазона вопроса, не результат реального анализа (заглушка, см. docs/chat/20260817/002-CLAUDE-METHODOLOGY.md).`;

		if (question.type === 'boolean') {
			const vote = ratio >= 0.5 ? 1 : 0;
			return {
				optimistic: vote,
				realistic: vote,
				pessimistic: vote,
				confidence,
				rationale: `[MOCK] ${meta.label} (${meta.focus}): голос ${vote ? '"да"' : '"нет"'}. ${disclaimer}`
			};
		}

		const lo = question.min_value ?? 0;
		const hi = question.max_value ?? lo + 100;
		const span = Math.max(hi - lo, 1e-6);
		const realistic = lo + span * ratio;
		const spreadAbs = span * meta.spread;
		const optimistic = Math.min(hi, Math.max(lo, realistic + spreadAbs));
		const pessimistic = Math.min(hi, Math.max(lo, realistic - spreadAbs));
		const unit = question.unit ? ` ${question.unit}` : '';

		return {
			optimistic,
			realistic,
			pessimistic,
			confidence,
			rationale: `[MOCK] ${meta.label} (${meta.focus}): ${realistic.toFixed(2)}${unit}. ${disclaimer}`
		};
	}

	/** Placeholder round synthesis — real disagreement analysis needs a real LLM reading the five
	 * rationales; this only reports the already-computed round stats. */
	private static buildBlueSynthesis(
		question: WbdQuestionRow,
		snapshot: ReturnType<typeof toStructSnapshot> | undefined,
		rationales: { hat: AgentHat; rationale: string }[]
	): string {
		const header = `[MOCK] Blue Hat — синтез раунда по вопросу «${question.text}»`;
		if (!snapshot || snapshot.countResponses === 0) {
			return `${header}\nНедостаточно ответов для консенсуса.`;
		}
		const stats = `Медиана ${formatStat(snapshot.median)}, Q1–Q3 [${formatStat(snapshot.q1)}; ${formatStat(snapshot.q3)}], консенсус: ${snapshot.consensusLevel ?? 'н/д'} (${snapshot.countResponses} ответов).`;
		const voices = rationales.map((entry) => AGENT_HAT_META[entry.hat].label).join(', ');
		return `${header}\n${stats}\nУчаствовали: ${voices}.\nЭто заглушка синтеза — реальный анализ расхождений между шляпами появится после подключения LLM.`;
	}
}
