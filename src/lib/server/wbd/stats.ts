export interface WbdRoundStats {
	count: number;
	median: number | null;
	q1: number | null;
	q3: number | null;
	min: number | null;
	max: number | null;
	consensusLevel: 'high' | 'medium' | 'low' | null;
}

function quantile(sorted: number[], q: number): number {
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	}
	return sorted[base];
}

export function computeRoundStats(values: number[]): WbdRoundStats {
	if (values.length === 0) {
		return { count: 0, median: null, q1: null, q3: null, min: null, max: null, consensusLevel: null };
	}
	const sorted = [...values].sort((a, b) => a - b);
	const min = sorted[0];
	const max = sorted[sorted.length - 1];
	const median = quantile(sorted, 0.5);
	const q1 = quantile(sorted, 0.25);
	const q3 = quantile(sorted, 0.75);

	let consensusLevel: WbdRoundStats['consensusLevel'] = null;
	if (sorted.length >= 2) {
		const iqr = q3 - q1;
		const spreadRatio = median !== 0 ? iqr / Math.abs(median) : iqr;
		consensusLevel = spreadRatio <= 0.15 ? 'high' : spreadRatio <= 0.35 ? 'medium' : 'low';
	}

	return { count: sorted.length, median, q1, q3, min, max, consensusLevel };
}
