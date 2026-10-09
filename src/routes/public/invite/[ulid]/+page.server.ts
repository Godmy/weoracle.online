import { error, fail, isHttpError, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ManagerExpert } from '$lib/server/class/manager/expert';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import { ManagerMagicLink } from '$lib/server/class/manager/magic-link';
import { ManagerEmail } from '$lib/server/class/manager/email';

const FROM = { email: 'login@weoracle.online', name: 'WeOracle' };

interface PublicSessionRow {
	id: string;
	title: string;
	description: string | null;
	image_url: string | null;
	assumptions: string | null;
	status: string;
	current_round: number;
	max_rounds: number;
	question_count: number;
}

type PreviewPoint = {
	time: string;
	min: number;
	low: number;
	consensus: number;
	high: number;
	max: number;
	market?: number;
	procurement?: number;
};

type PreviewQuestion = {
	id: string;
	title: string;
	unit: string;
	rounds: {
		round: number;
		optimistic: number;
		realistic: number;
		pessimistic: number;
		confidence: number;
	}[];
};

type PreviewDiscussion = {
	id: string;
	roundNumber: number;
	questionTitle: string;
	alias: string;
	message: string;
	createdAt: string;
};

type PublicInvitePreview = {
	summary: string;
	chartTitle: string;
	chartDescription: string;
	chartCurrency: string;
	chartPoints: PreviewPoint[];
	questions: PreviewQuestion[];
	discussions: PreviewDiscussion[];
};

type PublicSessionLoad = {
	session: PublicSessionRow;
	preview?: PublicInvitePreview;
	isDevPreview: boolean;
};

type DevQuestionSeed = {
	id: string;
	orderIndex: number;
	category: string;
	text: string;
	type: 'estimate';
	unit: string;
	minValue: number;
	maxValue: number;
};

type DevExpertSeed = {
	id: string;
	email: string;
	name: string;
	token: string;
	alias: string;
};

type DevAnswerSeed = {
	id: string;
	questionId: string;
	roundNumber: number;
	expertToken: string;
	optimistic: number;
	realistic: number;
	pessimistic: number;
	rationale: string;
	confidence: number;
};

type DevDiscussionSeed = {
	id: string;
	questionId: string;
	roundNumber: number;
	expertToken: string;
	alias: string;
	message: string;
	createdAt: string;
};

const devInvitePreviews: Record<string, PublicSessionLoad> = {
	'3d245fd6-013b-4ade-919c-2c407c2c6135': {
		isDevPreview: true,
		session: {
			id: '3d245fd6-013b-4ade-919c-2c407c2c6135',
			title: 'Regional fuel price dynamics',
			description:
				'Expert estimate of gasoline and diesel price bands across the next planning periods, with visible uncertainty drivers from previous rounds.',
			image_url: '/sessions/FuelCost.png',
			assumptions:
				'Assume current excise policy, planned refinery maintenance, and no emergency export restrictions.',
			status: 'round_3',
			current_round: 3,
			max_rounds: 3,
			question_count: 6
		},
		preview: {
			summary:
				'Two rounds have already narrowed the fuel-price corridor. The open round asks experts to confirm whether logistics pressure or refinery maintenance remains the dominant risk.',
			chartTitle: 'Fuel price consensus corridor',
			chartDescription: 'Round-by-round Delphi band, rubles per liter',
			chartCurrency: 'RUB',
			chartPoints: [
				{ time: 'R1', min: 72, low: 75, consensus: 79, high: 85, max: 91, market: 78, procurement: 76 },
				{ time: 'R2', min: 74, low: 77, consensus: 81, high: 87, max: 93, market: 80, procurement: 78 },
				{ time: 'R3', min: 75, low: 78, consensus: 82, high: 88, max: 94, market: 81, procurement: 79 }
			],
			questions: [
				{
					id: 'fuel-ai-95',
					title: 'AI-95 retail price by the end of the quarter',
					unit: 'RUB/l',
					rounds: [
						{ round: 1, optimistic: 75, realistic: 79, pessimistic: 84, confidence: 3 },
						{ round: 2, optimistic: 77, realistic: 80, pessimistic: 83, confidence: 4 }
					]
				},
				{
					id: 'diesel-wholesale',
					title: 'Wholesale diesel corridor during peak logistics load',
					unit: 'RUB/l',
					rounds: [
						{ round: 1, optimistic: 83, realistic: 87, pessimistic: 94, confidence: 3 },
						{ round: 2, optimistic: 85, realistic: 88, pessimistic: 92, confidence: 4 }
					]
				}
			],
			discussions: [
				{
					id: 'fuel-discussion-1',
					roundNumber: 1,
					questionTitle: 'AI-95 retail price by the end of the quarter',
					alias: 'Expert Blue',
					message:
						'The first spread should stay wide because refinery maintenance dates are still moving between regions.',
					createdAt: '2026-08-03 10:20'
				},
				{
					id: 'fuel-discussion-2',
					roundNumber: 1,
					questionTitle: 'Wholesale diesel corridor during peak logistics load',
					alias: 'Expert Green',
					message:
						'Logistics constraints matter more for diesel than for gasoline, especially in regions with rail bottlenecks.',
					createdAt: '2026-08-03 11:05'
				},
				{
					id: 'fuel-discussion-3',
					roundNumber: 2,
					questionTitle: 'AI-95 retail price by the end of the quarter',
					alias: 'Expert Amber',
					message:
						'The second-round estimates converge if we treat excise changes as already priced into the market signal.',
					createdAt: '2026-08-04 09:40'
				}
			]
		}
	},
	'd234194b-921d-41bc-aa79-4825b18e8a23': {
		isDevPreview: true,
		session: {
			id: 'd234194b-921d-41bc-aa79-4825b18e8a23',
			title: 'RUB/USD exchange-rate corridor',
			description: 'Public expert forecast for the possible RUB/USD range and uncertainty factors.',
			image_url: '/sessions/RubleAndDollar.png',
			assumptions: 'Assume no capital control shock and a stable commodity export schedule.',
			status: 'round_2',
			current_round: 2,
			max_rounds: 3,
			question_count: 5
		},
		preview: {
			summary: 'Round 1 surfaced the main divergence between trade-balance and rate-policy views.',
			chartTitle: 'Exchange-rate consensus corridor',
			chartDescription: 'Expert band by Delphi round',
			chartCurrency: 'RUB',
			chartPoints: [
				{ time: 'R1', min: 84, low: 89, consensus: 94, high: 101, max: 108, market: 95, procurement: 92 },
				{ time: 'R2', min: 86, low: 91, consensus: 95, high: 100, max: 105, market: 96, procurement: 93 }
			],
			questions: [
				{
					id: 'rub-usd',
					title: 'RUB/USD rate at the end of the quarter',
					unit: 'RUB/USD',
					rounds: [{ round: 1, optimistic: 89, realistic: 94, pessimistic: 101, confidence: 3 }]
				}
			],
			discussions: [
				{
					id: 'rub-discussion-1',
					roundNumber: 1,
					questionTitle: 'RUB/USD rate at the end of the quarter',
					alias: 'Expert Blue',
					message: 'The upside risk is mostly liquidity, not the baseline trade balance.',
					createdAt: '2026-08-02 14:10'
				}
			]
		}
	},
	'406f8a5a-6b2f-4a14-9694-5bf017ee3c67': {
		isDevPreview: true,
		session: {
			id: '406f8a5a-6b2f-4a14-9694-5bf017ee3c67',
			title: 'AI impact on HR roles',
			description: 'Public expert forecast on jobs, skill demand, and HR operating-model changes.',
			image_url: '/sessions/HRAndAI.png',
			assumptions: 'Assume current enterprise adoption speed and no major labor regulation shock.',
			status: 'round_2',
			current_round: 2,
			max_rounds: 3,
			question_count: 7
		},
		preview: {
			summary: 'Experts agree on faster automation of screening, but differ on retraining capacity.',
			chartTitle: 'HR automation consensus corridor',
			chartDescription: 'Share of routine HR tasks affected by AI',
			chartCurrency: '%',
			chartPoints: [
				{ time: 'R1', min: 18, low: 27, consensus: 39, high: 52, max: 66, market: 42, procurement: 35 },
				{ time: 'R2', min: 24, low: 32, consensus: 43, high: 53, max: 61, market: 45, procurement: 38 }
			],
			questions: [
				{
					id: 'hr-routine',
					title: 'Share of routine HR tasks affected within 12 months',
					unit: '%',
					rounds: [{ round: 1, optimistic: 27, realistic: 39, pessimistic: 52, confidence: 3 }]
				}
			],
			discussions: [
				{
					id: 'hr-discussion-1',
					roundNumber: 1,
					questionTitle: 'Share of routine HR tasks affected within 12 months',
					alias: 'Expert Green',
					message: 'Screening is moving faster than onboarding because the risk model is clearer.',
					createdAt: '2026-08-01 16:30'
				}
			]
		}
	}
};

const devInviteAliases: Record<string, string> = {
	'price-corridor': 'd234194b-921d-41bc-aa79-4825b18e8a23',
	'market-entry-timing': '406f8a5a-6b2f-4a14-9694-5bf017ee3c67',
	'capex-readiness': '3d245fd6-013b-4ade-919c-2c407c2c6135'
};

const devFuelQuestions: DevQuestionSeed[] = [
	{
		id: 'fuel-ai-95',
		orderIndex: 0,
		category: 'Retail',
		text: 'AI-95 retail price by the end of the quarter',
		type: 'estimate',
		unit: 'RUB/l',
		minValue: 65,
		maxValue: 95
	},
	{
		id: 'fuel-diesel-wholesale',
		orderIndex: 1,
		category: 'Wholesale',
		text: 'Wholesale diesel corridor during peak logistics load',
		type: 'estimate',
		unit: 'RUB/l',
		minValue: 70,
		maxValue: 105
	},
	{
		id: 'fuel-logistics-risk',
		orderIndex: 2,
		category: 'Risk',
		text: 'Probability that logistics constraints move the regional corridor above baseline',
		type: 'estimate',
		unit: '%',
		minValue: 0,
		maxValue: 100
	}
];

const devFuelExperts: DevExpertSeed[] = [
	{
		id: 'dev-expert-blue-user',
		email: 'expert.blue@weoracle.dev',
		name: 'Expert Blue',
		token: 'dev-token-blue',
		alias: 'Expert Blue'
	},
	{
		id: 'dev-expert-green-user',
		email: 'expert.green@weoracle.dev',
		name: 'Expert Green',
		token: 'dev-token-green',
		alias: 'Expert Green'
	},
	{
		id: 'dev-expert-amber-user',
		email: 'expert.amber@weoracle.dev',
		name: 'Expert Amber',
		token: 'dev-token-amber',
		alias: 'Expert Amber'
	}
];

const devFuelAnswers: DevAnswerSeed[] = [
	{
		id: 'fuel-ai-95-r1-blue',
		questionId: 'fuel-ai-95',
		roundNumber: 1,
		expertToken: 'dev-token-blue',
		optimistic: 74,
		realistic: 79,
		pessimistic: 85,
		rationale: 'July regional observations put AI-95 materially above the national early-June average.',
		confidence: 3
	},
	{
		id: 'fuel-ai-95-r1-green',
		questionId: 'fuel-ai-95',
		roundNumber: 1,
		expertToken: 'dev-token-green',
		optimistic: 76,
		realistic: 80,
		pessimistic: 84,
		rationale: 'Regional logistics explain most of the upside spread after the summer price step-up.',
		confidence: 3
	},
	{
		id: 'fuel-ai-95-r2-blue',
		questionId: 'fuel-ai-95',
		roundNumber: 2,
		expertToken: 'dev-token-blue',
		optimistic: 77,
		realistic: 80,
		pessimistic: 83,
		rationale: 'Excise assumptions are now aligned across experts.',
		confidence: 4
	},
	{
		id: 'fuel-ai-95-r2-amber',
		questionId: 'fuel-ai-95',
		roundNumber: 2,
		expertToken: 'dev-token-amber',
		optimistic: 78,
		realistic: 81,
		pessimistic: 84,
		rationale: 'Market signal points slightly above procurement target.',
		confidence: 4
	},
	{
		id: 'fuel-diesel-r1-green',
		questionId: 'fuel-diesel-wholesale',
		roundNumber: 1,
		expertToken: 'dev-token-green',
		optimistic: 83,
		realistic: 87,
		pessimistic: 94,
		rationale: 'Peak logistics load creates a larger upside corridor for diesel.',
		confidence: 3
	},
	{
		id: 'fuel-diesel-r2-blue',
		questionId: 'fuel-diesel-wholesale',
		roundNumber: 2,
		expertToken: 'dev-token-blue',
		optimistic: 85,
		realistic: 88,
		pessimistic: 92,
		rationale: 'Rail bottleneck assumptions narrowed after round 1.',
		confidence: 4
	},
	{
		id: 'fuel-logistics-r1-amber',
		questionId: 'fuel-logistics-risk',
		roundNumber: 1,
		expertToken: 'dev-token-amber',
		optimistic: 28,
		realistic: 45,
		pessimistic: 63,
		rationale: 'Risk is concentrated in regions with delayed deliveries.',
		confidence: 3
	},
	{
		id: 'fuel-logistics-r2-green',
		questionId: 'fuel-logistics-risk',
		roundNumber: 2,
		expertToken: 'dev-token-green',
		optimistic: 32,
		realistic: 48,
		pessimistic: 58,
		rationale: 'The second round narrows the probability band.',
		confidence: 4
	}
];

const devFuelDiscussions: DevDiscussionSeed[] = [
	{
		id: 'fuel-discussion-1',
		questionId: 'fuel-ai-95',
		roundNumber: 1,
		expertToken: 'dev-token-blue',
		alias: 'Expert Blue',
		message:
			'The first spread should stay wide because refinery maintenance dates are still moving between regions.',
		createdAt: '2026-08-03 10:20:00'
	},
	{
		id: 'fuel-discussion-2',
		questionId: 'fuel-diesel-wholesale',
		roundNumber: 1,
		expertToken: 'dev-token-green',
		alias: 'Expert Green',
		message:
			'Logistics constraints matter more for diesel than for gasoline, especially in regions with rail bottlenecks.',
		createdAt: '2026-08-03 11:05:00'
	},
	{
		id: 'fuel-discussion-3',
		questionId: 'fuel-ai-95',
		roundNumber: 2,
		expertToken: 'dev-token-amber',
		alias: 'Expert Amber',
		message:
			'The second-round estimates converge if we treat excise changes as already priced into the market signal.',
		createdAt: '2026-08-04 09:40:00'
	}
];

function loadDevPublicSession(ulid: string): PublicSessionLoad | undefined {
	const id = devInviteAliases[ulid] ?? ulid;
	const preview = devInvitePreviews[id];
	if (!preview) return undefined;
	return {
		...preview,
		session: {
			...preview.session,
			id: ulid
		}
	};
}

export function _isLocalDev(url: URL): boolean {
	return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

export async function _ensureDevFuelSession(db: D1Like, ulid: string): Promise<void> {
	const devSession = devInvitePreviews['3d245fd6-013b-4ade-919c-2c407c2c6135']?.session;
	if (!devSession) return;

	await db
		.prepare(
			`INSERT INTO wbd_users (id, email, name, role)
			 VALUES ('dev-coordinator-user', 'coordinator@weoracle.dev', 'Dev Coordinator', 'coordinator')
			 ON CONFLICT(email) DO UPDATE SET name = excluded.name`
		)
		.bind()
		.run();

	for (const expert of devFuelExperts) {
		await db
			.prepare(
				`INSERT INTO wbd_users (id, email, name, role)
				 VALUES (?1, ?2, ?3, 'expert')
				 ON CONFLICT(email) DO UPDATE SET name = excluded.name`
			)
			.bind(expert.id, expert.email, expert.name)
			.run();
	}

	await db
		.prepare(
			`INSERT INTO wbd_sessions
			 (id, title, description, image_url, is_public, status, current_round, max_rounds, assumptions, created_by, started_at)
			 VALUES (?1, ?2, ?3, ?4, 1, 'round_3', 3, 3, ?5, 'dev-coordinator-user', CURRENT_TIMESTAMP)
			 ON CONFLICT(id) DO UPDATE SET
				title = excluded.title,
				description = excluded.description,
				image_url = excluded.image_url,
				is_public = 1,
				status = 'round_3',
				current_round = 3,
				max_rounds = 3,
				assumptions = excluded.assumptions,
				started_at = COALESCE(wbd_sessions.started_at, excluded.started_at)`
		)
		.bind(ulid, devSession.title, devSession.description, devSession.image_url, devSession.assumptions)
		.run();

	for (const expert of devFuelExperts) {
		await db
			.prepare(
				`INSERT INTO wbd_session_experts (id, session_id, user_id, token, alias, joined_at)
				 VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)
				 ON CONFLICT(session_id, user_id) DO UPDATE SET
					token = excluded.token,
					alias = excluded.alias,
					joined_at = COALESCE(wbd_session_experts.joined_at, excluded.joined_at)`
			)
			.bind(`${ulid}-${expert.id}`, ulid, expert.id, `${ulid}-${expert.token}`, expert.alias)
			.run();
	}

	for (const question of devFuelQuestions) {
		await db
			.prepare(
				`INSERT INTO wbd_questions
				 (id, session_id, order_index, category, text, type, unit, min_value, max_value, required)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 1)
				 ON CONFLICT(id) DO UPDATE SET
					order_index = excluded.order_index,
					category = excluded.category,
					text = excluded.text,
					type = excluded.type,
					unit = excluded.unit,
					min_value = excluded.min_value,
					max_value = excluded.max_value,
					required = excluded.required`
			)
			.bind(
				`${ulid}-${question.id}`,
				ulid,
				question.orderIndex,
				question.category,
				question.text,
				question.type,
				question.unit,
				question.minValue,
				question.maxValue
			)
			.run();
	}

	for (const answer of devFuelAnswers) {
		await db
			.prepare(
				`INSERT INTO wbd_answers
				 (id, question_id, round_number, expert_token, optimistic, realistic, pessimistic, rationale, confidence, submitted_at, updated_at)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				 ON CONFLICT(question_id, round_number, expert_token) DO UPDATE SET
					optimistic = excluded.optimistic,
					realistic = excluded.realistic,
					pessimistic = excluded.pessimistic,
					rationale = excluded.rationale,
					confidence = excluded.confidence,
					submitted_at = excluded.submitted_at,
					updated_at = excluded.updated_at`
			)
			.bind(
				`${ulid}-${answer.id}`,
				`${ulid}-${answer.questionId}`,
				answer.roundNumber,
				`${ulid}-${answer.expertToken}`,
				answer.optimistic,
				answer.realistic,
				answer.pessimistic,
				answer.rationale,
				answer.confidence
			)
			.run();
	}

	for (const discussion of devFuelDiscussions) {
		await db
			.prepare(
				`INSERT INTO wbd_discussion_messages
				 (id, question_id, round_number, expert_token, alias, message, created_at)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
				 ON CONFLICT(id) DO UPDATE SET
					round_number = excluded.round_number,
					expert_token = excluded.expert_token,
					alias = excluded.alias,
					message = excluded.message,
					created_at = excluded.created_at`
			)
			.bind(
				`${ulid}-${discussion.id}`,
				`${ulid}-${discussion.questionId}`,
				discussion.roundNumber,
				`${ulid}-${discussion.expertToken}`,
				discussion.alias,
				discussion.message,
				discussion.createdAt
			)
			.run();
	}
}

async function loadPreviewFromTables(
	db: D1Like,
	session: PublicSessionRow
): Promise<PublicInvitePreview | undefined> {
	const { results: rows } = await db
		.prepare(
			`SELECT q.id AS question_id, q.text AS question_title, q.unit, a.round_number,
			        a.optimistic, a.realistic, a.pessimistic, a.confidence
			 FROM wbd_questions q
			 LEFT JOIN wbd_answers a ON a.question_id = q.id AND a.submitted_at IS NOT NULL
			 WHERE q.session_id = ?1
			 ORDER BY q.order_index, a.round_number`
		)
		.bind(session.id)
		.all<{
			question_id: string;
			question_title: string;
			unit: string | null;
			round_number: number | null;
			optimistic: number | null;
			realistic: number | null;
			pessimistic: number | null;
			confidence: number | null;
		}>();

	if (rows.length === 0) return undefined;

	const { results: discussionRows } = await db
		.prepare(
			`SELECT dm.id, dm.round_number, q.text AS question_title, dm.alias, dm.message, dm.created_at
			 FROM wbd_discussion_messages dm
			 JOIN wbd_questions q ON q.id = dm.question_id
			 WHERE q.session_id = ?1 AND dm.round_number < ?2
			 ORDER BY dm.round_number, dm.created_at`
		)
		.bind(session.id, session.current_round)
		.all<{
			id: string;
			round_number: number;
			question_title: string;
			alias: string;
			message: string;
			created_at: string;
		}>();

	const questionMap = new Map<string, PreviewQuestion>();
	const roundMap = new Map<number, { optimistic: number[]; realistic: number[]; pessimistic: number[] }>();

	for (const row of rows) {
		if (!questionMap.has(row.question_id)) {
			questionMap.set(row.question_id, {
				id: row.question_id,
				title: row.question_title,
				unit: row.unit ?? '',
				rounds: []
			});
		}

		if (row.round_number === null || row.round_number >= session.current_round) continue;

		const question = questionMap.get(row.question_id)!;
		question.rounds.push({
			round: row.round_number,
			optimistic: Number(row.optimistic ?? 0),
			realistic: Number(row.realistic ?? 0),
			pessimistic: Number(row.pessimistic ?? 0),
			confidence: Number(row.confidence ?? 0)
		});

		const round =
			roundMap.get(row.round_number) ?? { optimistic: [], realistic: [], pessimistic: [] };
		if (row.optimistic !== null) round.optimistic.push(Number(row.optimistic));
		if (row.realistic !== null) round.realistic.push(Number(row.realistic));
		if (row.pessimistic !== null) round.pessimistic.push(Number(row.pessimistic));
		roundMap.set(row.round_number, round);
	}

	function average(values: number[]): number {
		if (values.length === 0) return 0;
		return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
	}

	const chartPoints = [...roundMap.entries()].map(([round, value]) => {
		const optimistic = average(value.optimistic);
		const realistic = average(value.realistic);
		const pessimistic = average(value.pessimistic);
		return {
			time: `R${round}`,
			min: optimistic - 2,
			low: optimistic,
			consensus: realistic,
			high: pessimistic,
			max: pessimistic + 2,
			market: realistic + 1,
			procurement: realistic - 2
		};
	});

	return {
		summary: `Loaded from D1: ${rows.filter((row) => row.round_number !== null).length} submitted estimates and ${discussionRows.length} discussion messages before round ${session.current_round}.`,
		chartTitle: `${session.title} consensus corridor`,
		chartDescription: 'Computed from submitted estimates in D1',
		chartCurrency: [...questionMap.values()][0]?.unit ?? '',
		chartPoints,
		questions: [...questionMap.values()],
		discussions: discussionRows.map((row) => ({
			id: row.id,
			roundNumber: row.round_number,
			questionTitle: row.question_title,
			alias: row.alias,
			message: row.message,
			createdAt: row.created_at
		}))
	};
}

async function loadPublicSession(db: D1Like | undefined, ulid: string): Promise<PublicSessionLoad> {
	const devSession = loadDevPublicSession(ulid);
	if (!db) {
		if (devSession) return devSession;
		error(404, 'This poll is not public or does not exist');
	}

	const session = await db
		.prepare(
			`SELECT s.id, s.title, s.description, s.image_url, s.assumptions, s.status, s.current_round, s.max_rounds,
			        (SELECT COUNT(*) FROM wbd_questions q WHERE q.session_id = s.id) AS question_count
			 FROM wbd_sessions s
			 WHERE s.id = ?1 AND s.is_public = 1`
		)
		.bind(ulid)
		.first<PublicSessionRow>();
	if (!session) {
		if (devSession) return devSession;
		error(404, 'This poll is not public or does not exist');
	}
	const preview = await loadPreviewFromTables(db, session);
	return {
		session,
		preview: preview ?? devSession?.preview,
		isDevPreview: false
	};
}

export const load: PageServerLoad = async ({ params, cookies, platform, url }) => {
	const db = platform?.env?.DB;
	if (db && _isLocalDev(url) && params.ulid === '3d245fd6-013b-4ade-919c-2c407c2c6135') {
		await _ensureDevFuelSession(db, params.ulid);
	}
	const { session, preview, isDevPreview } = await loadPublicSession(db, params.ulid);

	const publicCookieName = ManagerExpert.publicCookieName(params.ulid);
	const publicToken = cookies.get(publicCookieName);
	if (!isDevPreview && db && publicToken) {
		try {
			await ManagerExpert.resolveByToken(db, publicToken);
			redirect(303, `/public/band/${params.ulid}`);
		} catch (err) {
			if (isHttpError(err) && err.status === 404) {
				cookies.delete(publicCookieName, { path: '/public' });
			} else {
				throw err;
			}
		}
	}

	return { session, preview, isDevPreview };
};

export const actions: Actions = {
	join: async ({ params, request, url, platform, cookies }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const name = String(form.get('name') ?? '').trim();
		if (!email || !name) {
			return fail(400, { message: 'Email and name are required' });
		}

		const db = platform?.env?.DB;
		if (db && _isLocalDev(url) && params.ulid === '3d245fd6-013b-4ade-919c-2c407c2c6135') {
			await _ensureDevFuelSession(db, params.ulid);
			const expert = await ManagerExpert.invite(db, params.ulid, { email, name });
			if (!expert) error(500, 'Could not join this poll');

			cookies.set(ManagerExpert.publicCookieName(params.ulid), expert.token, {
				path: '/public',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30
			});

			redirect(303, `/public/band/${params.ulid}`);
		}

		const { isDevPreview } = await loadPublicSession(db, params.ulid);
		if (isDevPreview) {
			return { sent: true, email, devPreview: true };
		}

		const token = await ManagerMagicLink.create(platform!.env.KV, {
			email,
			name,
			sessionId: params.ulid
		});
		const link = `${url.origin}/public/verify?token=${token}`;

		const apiKey = platform!.env.RESEND_API_KEY;
		if (!apiKey) error(500, 'Email sending is not configured');
		try {
			await ManagerEmail.send(apiKey, {
				to: email,
				from: FROM,
				subject: 'Your link to WeOracle',
				html: ManagerMagicLink.emailHtml(link),
				text: ManagerMagicLink.emailText(link)
			});
		} catch (err) {
			console.error('sendEmailViaResend failed:', err);
			return fail(502, { message: 'Could not send the sign-in email — please try again' });
		}

		return { sent: true, email };
	}
};
