import indicators from '$lib/server/data/json/rosstat/index.json';
import type { RosstatIndicator } from '$lib/server/interface/api/rosstat/indicator';
import type { RosstatObservation } from '$lib/server/interface/api/rosstat/observation';

type RosstatDataFormat = 'sdmx' | 'excel';

type RosstatDataId = {
	id: string | number;
};

export class ServiceRosstat {
	static readonly fedstatBaseUrl = 'https://www.fedstat.ru';

	static listKnownIndicators(): RosstatIndicator[] {
		return indicators as RosstatIndicator[];
	}

	static getKnownIndicator(indicatorId: string): RosstatIndicator | undefined {
		return ServiceRosstat.listKnownIndicators().find((indicator) => indicator.id === indicatorId);
	}

	static async fetchIndicatorPage(indicatorId: string): Promise<string> {
		const res = await fetch(`${ServiceRosstat.fedstatBaseUrl}/indicator/${indicatorId}`);
		if (!res.ok) {
			throw new Error(`Rosstat indicator page request failed (${res.status}): ${indicatorId}`);
		}
		return res.text();
	}

	static extractDataIds(indicatorPageHtml: string): RosstatDataId[] {
		const dataIdsMatch =
			indicatorPageHtml.match(/dataIds\s*[:=]\s*(\[[\s\S]*?\])/i) ??
			indicatorPageHtml.match(/data_ids\s*[:=]\s*(\[[\s\S]*?\])/i);
		if (!dataIdsMatch) return [];

		try {
			const parsed = JSON.parse(dataIdsMatch[1]) as unknown;
			if (!Array.isArray(parsed)) return [];
			return parsed.flatMap((item) => {
				if (typeof item === 'string' || typeof item === 'number') return [{ id: item }];
				if (item && typeof item === 'object' && 'id' in item) {
					const id = (item as { id?: unknown }).id;
					if (typeof id === 'string' || typeof id === 'number') return [{ id }];
				}
				return [];
			});
		} catch {
			return [];
		}
	}

	static async fetchIndicatorData(indicatorId: string): Promise<string> {
		const res = await fetch(`${ServiceRosstat.fedstatBaseUrl}/indicator/data.do?id=${indicatorId}`);
		if (!res.ok) {
			throw new Error(`Rosstat indicator data request failed (${res.status}): ${indicatorId}`);
		}
		return res.text();
	}

	static async postDataIds(dataIds: RosstatDataId[], format: RosstatDataFormat = 'sdmx'): Promise<ArrayBuffer> {
		const res = await fetch(`${ServiceRosstat.fedstatBaseUrl}/indicator/data.do?format=${format}`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(dataIds)
		});
		if (!res.ok) {
			throw new Error(`Rosstat data ids request failed (${res.status})`);
		}
		return res.arrayBuffer();
	}

	static async fetchFilteredSdmx(indicatorId: string): Promise<string> {
		const page = await ServiceRosstat.fetchIndicatorPage(indicatorId);
		const dataIds = ServiceRosstat.extractDataIds(page);
		if (dataIds.length === 0) {
			throw new Error(`Rosstat data ids were not found on indicator page: ${indicatorId}`);
		}

		const buffer = await ServiceRosstat.postDataIds(dataIds, 'sdmx');
		return new TextDecoder().decode(buffer);
	}

	static parseSdmxObservations(indicatorId: string, xml: string): RosstatObservation[] {
		return Array.from(xml.matchAll(/<Obs\b([^>]*)\/>|<Obs\b([^>]*)>([\s\S]*?)<\/Obs>/g)).map(
			(match) => {
				const attrs = ServiceRosstat.parseAttributes(match[1] || match[2] || '');
				const rawValue = attrs.OBS_VALUE ?? attrs.ObsValue ?? attrs.value;
				const value = rawValue === undefined || rawValue === '' ? null : Number(rawValue);
				const time = attrs.TIME_PERIOD ?? attrs.Time ?? attrs.PERIOD;
				const unit = attrs.UNIT_MEASURE ?? attrs.Unit;
				const dimensions = Object.fromEntries(
					Object.entries(attrs).filter(([key]) => !['OBS_VALUE', 'ObsValue', 'value'].includes(key))
				);

				return {
					indicatorId,
					time,
					value: Number.isFinite(value) ? value : null,
					unit,
					dimensions,
					rawAttributes: attrs
				};
			}
		);
	}

	private static parseAttributes(raw: string): Record<string, string> {
		return Object.fromEntries(
			Array.from(raw.matchAll(/([\w:-]+)="([^"]*)"/g)).map((match) => [match[1], match[2]])
		);
	}
}
