import type { FredObservation } from '$lib/server/interface/api/fred/observation';

interface FredObservationsResponse {
	error_code?: number;
	error_message?: string;
	observations?: { date: string; value: string }[];
}

// FRED (Federal Reserve Economic Data) — ставки/макро США и десятки тысяч других рядов, JSON, требует бесплатный api_key
// (https://fred.stlouisfed.org/docs/api/api_key.html). Без ключа отдаёт {"error_code":400,...}.
export class ServiceFred {
	// https://api.stlouisfed.org/fred/series/observations — historical range задаётся observationStart/observationEnd (YYYY-MM-DD).
	static async fetchSeriesObservations(
		seriesId: string,
		apiKey: string,
		options: { observationStart?: string; observationEnd?: string } = {}
	): Promise<FredObservation[]> {
		const params = new URLSearchParams({
			series_id: seriesId,
			api_key: apiKey,
			file_type: 'json'
		});
		if (options.observationStart) params.set('observation_start', options.observationStart);
		if (options.observationEnd) params.set('observation_end', options.observationEnd);

		const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?${params}`);
		const body = (await res.json()) as FredObservationsResponse;

		if (!res.ok || body.error_code) {
			throw new Error(`FRED request failed (${body.error_code ?? res.status}): ${body.error_message ?? res.statusText}`);
		}

		return (body.observations ?? []).map((observation) => ({
			date: observation.date,
			value: observation.value === '.' ? null : Number(observation.value)
		}));
	}
}
