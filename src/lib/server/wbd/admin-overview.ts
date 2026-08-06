type QueryResult<T> = { results: T[] };

interface D1Statement {
	bind(...values: unknown[]): D1Statement;
	all<T = unknown>(): Promise<QueryResult<T>>;
	first<T = unknown>(): Promise<T | null>;
}

interface D1DatabaseLike {
	prepare(query: string): D1Statement;
}

export interface WbdQuestionOverviewRow {
	id: string;
	session_id: string;
	session_title: string;
	order_index: number;
	category: string | null;
	text: string;
	type: 'numeric' | 'percentage' | 'boolean';
	unit: string | null;
	required: 0 | 1;
	answer_count: number;
	discussion_count: number;
}

export interface WbdEstimateOverviewRow {
	id: string;
	session_id: string;
	session_title: string;
	question_text: string;
	round_number: number;
	expert_alias: string;
	expert_name: string;
	optimistic: number | null;
	realistic: number | null;
	pessimistic: number | null;
	confidence: number | null;
	submitted_at: string | null;
}

export interface WbdDiscussionOverviewRow {
	id: string;
	session_id: string;
	session_title: string;
	question_text: string;
	round_number: number;
	alias: string;
	message: string;
	created_at: string;
}

export interface WbdReportOverviewRow {
	id: string;
	session_id: string;
	session_title: string;
	title: string;
	status: 'draft' | 'published' | 'archived';
	format: 'json' | 'markdown' | 'html' | 'pdf';
	created_at: string;
	published_at: string | null;
}

export interface WbdReportCandidateRow {
	id: string;
	title: string;
	status: string;
	completed_at: string | null;
	question_count: number;
	response_count: number;
}

export interface WbdAnalyticsOverview {
	totalSessions: number;
	activeSessions: number;
	completedSessions: number;
	totalQuestions: number;
	totalAnswers: number;
	totalDiscussions: number;
	averageConfidence: number | null;
	highConsensus: number;
	mediumConsensus: number;
	lowConsensus: number;
	statusCounts: Array<{ status: string; count: number }>;
}

function scopeClause(userId: string | undefined, alias = 's') {
	return userId ? `WHERE ${alias}.created_by = ?1` : '';
}

function bindScope(statement: D1Statement, userId: string | undefined) {
	return userId ? statement.bind(userId) : statement;
}

export async function loadQuestionOverview(db: D1DatabaseLike, userId?: string) {
	const query = db.prepare(`
		SELECT
			q.id,
			q.session_id,
			s.title AS session_title,
			q.order_index,
			q.category,
			q.text,
			q.type,
			q.unit,
			q.required,
			COUNT(DISTINCT a.id) AS answer_count,
			COUNT(DISTINCT dm.id) AS discussion_count
		FROM wbd_questions q
		JOIN wbd_sessions s ON s.id = q.session_id
		LEFT JOIN wbd_answers a ON a.question_id = q.id AND a.submitted_at IS NOT NULL
		LEFT JOIN wbd_discussion_messages dm ON dm.question_id = q.id
		${scopeClause(userId)}
		GROUP BY q.id
		ORDER BY s.created_at DESC, q.order_index ASC
		LIMIT 200
	`);
	const { results } = await bindScope(query, userId).all<WbdQuestionOverviewRow>();
	return results;
}

export async function loadEstimateOverview(db: D1DatabaseLike, userId?: string) {
	const query = db.prepare(`
		SELECT
			a.id,
			s.id AS session_id,
			s.title AS session_title,
			q.text AS question_text,
			a.round_number,
			se.alias AS expert_alias,
			u.name AS expert_name,
			a.optimistic,
			a.realistic,
			a.pessimistic,
			a.confidence,
			a.submitted_at
		FROM wbd_answers a
		JOIN wbd_questions q ON q.id = a.question_id
		JOIN wbd_sessions s ON s.id = q.session_id
		JOIN wbd_session_experts se ON se.token = a.expert_token
		JOIN wbd_users u ON u.id = se.user_id
		${scopeClause(userId)}
		ORDER BY COALESCE(a.submitted_at, a.updated_at) DESC
		LIMIT 200
	`);
	const { results } = await bindScope(query, userId).all<WbdEstimateOverviewRow>();
	return results;
}

export async function loadDiscussionOverview(db: D1DatabaseLike, userId?: string) {
	const query = db.prepare(`
		SELECT
			dm.id,
			s.id AS session_id,
			s.title AS session_title,
			q.text AS question_text,
			dm.round_number,
			dm.alias,
			dm.message,
			dm.created_at
		FROM wbd_discussion_messages dm
		JOIN wbd_questions q ON q.id = dm.question_id
		JOIN wbd_sessions s ON s.id = q.session_id
		${scopeClause(userId)}
		ORDER BY dm.created_at DESC
		LIMIT 200
	`);
	const { results } = await bindScope(query, userId).all<WbdDiscussionOverviewRow>();
	return results;
}

export async function loadReportOverview(db: D1DatabaseLike, userId?: string) {
	const reportsQuery = db.prepare(`
		SELECT
			r.id,
			r.session_id,
			s.title AS session_title,
			r.title,
			r.status,
			r.format,
			r.created_at,
			r.published_at
		FROM wbd_final_reports r
		JOIN wbd_sessions s ON s.id = r.session_id
		${scopeClause(userId)}
		ORDER BY r.created_at DESC
		LIMIT 100
	`);
	const candidatesQuery = db.prepare(`
		SELECT
			s.id,
			s.title,
			s.status,
			s.completed_at,
			COUNT(DISTINCT q.id) AS question_count,
			COUNT(DISTINCT a.id) AS response_count
		FROM wbd_sessions s
		LEFT JOIN wbd_questions q ON q.session_id = s.id
		LEFT JOIN wbd_answers a ON a.question_id = q.id AND a.submitted_at IS NOT NULL
		${scopeClause(userId)}
		GROUP BY s.id
		ORDER BY COALESCE(s.completed_at, s.created_at) DESC
		LIMIT 100
	`);
	const [{ results: reports }, { results: candidates }] = await Promise.all([
		bindScope(reportsQuery, userId).all<WbdReportOverviewRow>(),
		bindScope(candidatesQuery, userId).all<WbdReportCandidateRow>()
	]);
	return { reports, candidates };
}

export async function loadAnalyticsOverview(db: D1DatabaseLike, userId?: string): Promise<WbdAnalyticsOverview> {
	const statusQuery = db.prepare(`
		SELECT s.status, COUNT(*) AS count
		FROM wbd_sessions s
		${scopeClause(userId)}
		GROUP BY s.status
		ORDER BY s.status
	`);
	const totalsQuery = db.prepare(`
		SELECT
			COUNT(DISTINCT s.id) AS totalSessions,
			COUNT(DISTINCT CASE WHEN s.status != 'completed' THEN s.id END) AS activeSessions,
			COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) AS completedSessions,
			COUNT(DISTINCT q.id) AS totalQuestions,
			COUNT(DISTINCT a.id) AS totalAnswers,
			COUNT(DISTINCT dm.id) AS totalDiscussions,
			AVG(a.confidence) AS averageConfidence
		FROM wbd_sessions s
		LEFT JOIN wbd_questions q ON q.session_id = s.id
		LEFT JOIN wbd_answers a ON a.question_id = q.id AND a.submitted_at IS NOT NULL
		LEFT JOIN wbd_discussion_messages dm ON dm.question_id = q.id
		${scopeClause(userId)}
	`);
	const consensusQuery = db.prepare(`
		SELECT
			COUNT(CASE WHEN rs.consensus_level = 'high' THEN 1 END) AS highConsensus,
			COUNT(CASE WHEN rs.consensus_level = 'medium' THEN 1 END) AS mediumConsensus,
			COUNT(CASE WHEN rs.consensus_level = 'low' THEN 1 END) AS lowConsensus
		FROM wbd_round_snapshots rs
		JOIN wbd_sessions s ON s.id = rs.session_id
		${scopeClause(userId)}
	`);

	const [{ results: statusCounts }, totals, consensus] = await Promise.all([
		bindScope(statusQuery, userId).all<{ status: string; count: number }>(),
		bindScope(totalsQuery, userId).first<Omit<WbdAnalyticsOverview, 'statusCounts'>>(),
		bindScope(consensusQuery, userId).first<Pick<WbdAnalyticsOverview, 'highConsensus' | 'mediumConsensus' | 'lowConsensus'>>()
	]);

	return {
		totalSessions: totals?.totalSessions ?? 0,
		activeSessions: totals?.activeSessions ?? 0,
		completedSessions: totals?.completedSessions ?? 0,
		totalQuestions: totals?.totalQuestions ?? 0,
		totalAnswers: totals?.totalAnswers ?? 0,
		totalDiscussions: totals?.totalDiscussions ?? 0,
		averageConfidence: totals?.averageConfidence ?? null,
		highConsensus: consensus?.highConsensus ?? 0,
		mediumConsensus: consensus?.mediumConsensus ?? 0,
		lowConsensus: consensus?.lowConsensus ?? 0,
		statusCounts
	};
}
