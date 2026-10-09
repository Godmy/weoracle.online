import type { WbdSessionRow } from '$lib/server/interface/db/session';
import type { WbdQuestionRow } from '$lib/server/interface/db/question';
import type { WbdExpertRow } from '$lib/server/interface/db/expert';
import type { WbdAnswerRow } from '$lib/server/interface/db/answer';
import type { WbdSnapshotRow } from '$lib/server/interface/db/snapshot';

// Read model assembled by ManagerSnapshot.getRoundView from the raw rows above.
export interface WbdRoundView {
	session: WbdSessionRow;
	questions: WbdQuestionRow[];
	experts: WbdExpertRow[];
	answersByQuestion: Record<string, WbdAnswerRow[]>;
	snapshotByQuestion: Record<string, WbdSnapshotRow | undefined>;
}
