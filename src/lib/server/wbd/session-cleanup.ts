import type { D1Like } from './db';

export async function deleteSessionProgressData(db: D1Like, sessionId: string): Promise<void> {
	await db
		.prepare(
			`DELETE FROM wbd_discussion_messages
			 WHERE question_id IN (SELECT id FROM wbd_questions WHERE session_id = ?1)`
		)
		.bind(sessionId)
		.run();
	await db
		.prepare(
			`DELETE FROM wbd_answers
			 WHERE question_id IN (SELECT id FROM wbd_questions WHERE session_id = ?1)`
		)
		.bind(sessionId)
		.run();
	await db.prepare(`DELETE FROM wbd_round_snapshots WHERE session_id = ?1`).bind(sessionId).run();
	await db.prepare(`DELETE FROM wbd_round_settings WHERE session_id = ?1`).bind(sessionId).run();
	await db.prepare(`DELETE FROM wbd_final_reports WHERE session_id = ?1`).bind(sessionId).run();
}

export async function deleteSessionTree(db: D1Like, sessionId: string): Promise<void> {
	await deleteSessionProgressData(db, sessionId);
	await db.prepare(`DELETE FROM wbd_session_experts WHERE session_id = ?1`).bind(sessionId).run();
	await db.prepare(`DELETE FROM wbd_questions WHERE session_id = ?1`).bind(sessionId).run();
	await db.prepare(`DELETE FROM wbd_audit_log WHERE session_id = ?1`).bind(sessionId).run();
	await db.prepare(`DELETE FROM wbd_sessions WHERE id = ?1`).bind(sessionId).run();
}
