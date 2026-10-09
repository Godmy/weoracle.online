/** Experts joined with their user record, plus a status derived from joined_at, for a given session. */
export const EXPERTS_BY_SESSION_SQL = `
	SELECT
		se.id,
		se.session_id,
		se.user_id,
		se.token,
		se.alias,
		se.invited_at,
		se.joined_at,
		se.expert_kind,
		se.agent_hat,
		u.email,
		u.name,
		CASE WHEN se.joined_at IS NOT NULL THEN 'joined' ELSE 'invited' END AS status
	FROM wbd_session_experts se
	JOIN wbd_users u ON u.id = se.user_id
	WHERE se.session_id = ?1
	ORDER BY se.invited_at
`;
