import type { WbdRoundStats } from '$lib/server/interface/db/round-stats';
import type { WbdQuestionType } from '$lib/server/interface/db/question';

function quantile(sorted: number[], q: number): number {
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	}
	return sorted[base];
}

/**
 * Boolean answers are stored as 0/1 in `realistic`, not a continuous quantity — the IQR/median
 * spread ratio below is meaningless for them (e.g. a clean 2-2 split produces median 0.5 and a
 * division-by-near-zero blowup). Consensus for a yes/no question is instead how lopsided the vote is.
 */
function computeBooleanConsensus(sorted: number[]): WbdRoundStats['consensusLevel'] {
	if (sorted.length === 0) return null;
	const yesCount = sorted.filter((value) => value >= 0.5).length;
	const majorityShare = Math.max(yesCount, sorted.length - yesCount) / sorted.length;
	return majorityShare >= 0.85 ? 'high' : majorityShare >= 0.65 ? 'medium' : 'low';
}

export function computeRoundStats(
	values: number[],
	questionType?: WbdQuestionType
): WbdRoundStats {
	if (values.length === 0) {
		return {
			count: 0,
			median: null,
			q1: null,
			q3: null,
			min: null,
			max: null,
			consensusLevel: null
		};
	}
	const sorted = [...values].sort((a, b) => a - b);
	const min = sorted[0];
	const max = sorted[sorted.length - 1];
	const median = quantile(sorted, 0.5);
	const q1 = quantile(sorted, 0.25);
	const q3 = quantile(sorted, 0.75);

	let consensusLevel: WbdRoundStats['consensusLevel'] = null;
	if (questionType === 'boolean') {
		consensusLevel = computeBooleanConsensus(sorted);
	} else if (sorted.length >= 2) {
		const iqr = q3 - q1;
		const spreadRatio = median !== 0 ? iqr / Math.abs(median) : iqr;
		consensusLevel = spreadRatio <= 0.15 ? 'high' : spreadRatio <= 0.35 ? 'medium' : 'low';
	}

	return { count: sorted.length, median, q1, q3, min, max, consensusLevel };
}
