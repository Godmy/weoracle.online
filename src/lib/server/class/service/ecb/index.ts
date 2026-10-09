import type { EcbCurrencyRate } from '$lib/server/interface/api/ecb/currency-rate';

// ECB Statistical Data Warehouse — официальные референсные курсы EUR-кросс, без ключа.
// Все три файла используют одну и ту же вложенную структуру <Cube><Cube time=..><Cube currency=.. rate=..//></Cube></Cube>,
// отличается только количество блоков <Cube time=..>.
export class ServiceEcb {
	private static parseCubeBlocks(xml: string): EcbCurrencyRate[] {
		return Array.from(xml.matchAll(/<Cube\s+time=["']([\d-]+)["']>([\s\S]*?)<\/Cube>/g)).flatMap(
			(dayMatch) => {
				const [, date, body] = dayMatch;
				return Array.from(
					body.matchAll(/<Cube\s+currency=["']([A-Z]+)["']\s+rate=["']([\d.]+)["']\s*\/>/g)
				).map((rateMatch) => ({
					currency: rateMatch[1],
					rate: Number(rateMatch[2]),
					date
				}));
			}
		);
	}

	private static async fetchAndParse(url: string): Promise<EcbCurrencyRate[]> {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`ECB request failed (${res.status}): ${url}`);
		}
		return ServiceEcb.parseCubeBlocks(await res.text());
	}

	// https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml — курсы на последний рабочий день.
	static async fetchDailyRates(): Promise<EcbCurrencyRate[]> {
		return ServiceEcb.fetchAndParse('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
	}

	// eurofxref-hist-90d.xml (последние ~90 дней) или eurofxref-hist.xml (вся история с 1999) — один запрос отдаёт сразу весь диапазон, без параметров дат.
	static async fetchHistoricalRates(range: '90d' | 'full' = '90d'): Promise<EcbCurrencyRate[]> {
		const file = range === 'full' ? 'eurofxref-hist.xml' : 'eurofxref-hist-90d.xml';
		return ServiceEcb.fetchAndParse(`https://www.ecb.europa.eu/stats/eurofxref/${file}`);
	}
}
