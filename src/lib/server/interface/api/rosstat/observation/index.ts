export interface RosstatObservation {
	indicatorId: string;
	time?: string;
	value: number | null;
	unit?: string;
	dimensions: Record<string, string>;
	rawAttributes: Record<string, string>;
}
