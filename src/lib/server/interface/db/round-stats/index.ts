export interface WbdRoundStats {
	count: number;
	median: number | null;
	q1: number | null;
	q3: number | null;
	min: number | null;
	max: number | null;
	consensusLevel: 'high' | 'medium' | 'low' | null;
}
