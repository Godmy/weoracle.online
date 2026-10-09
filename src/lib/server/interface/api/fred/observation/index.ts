// One row from FRED /fred/series/observations (file_type=json) — value is "." when the series has no data for that date.
export interface FredObservation {
	date: string;
	value: number | null;
}
