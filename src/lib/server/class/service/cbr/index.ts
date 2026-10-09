import type { CbrCurrencyRate } from '$lib/server/interface/api/cbr/currency-rate';
import type { CbrMetalRate } from '$lib/server/interface/api/cbr/metal-rate';

// ЦБ РФ отдаёт XML в windows-1251 без ключа и без лимитов — эталонный бесплатный источник
// курсов валют и учётных цен на драгметаллы для российского контекста.
const METAL_BY_CODE: Record<string, CbrMetalRate['metal']> = {
	'1': 'gold',
	'2': 'silver',
	'3': 'platinum',
	'4': 'palladium'
};

export class ServiceCbr {
	private static formatDate(date: Date): string {
		const day = String(date.getUTCDate()).padStart(2, '0');
		const month = String(date.getUTCMonth() + 1).padStart(2, '0');
		return `${day}/${month}/${date.getUTCFullYear()}`;
	}

	private static parseNumber(raw: string | undefined): number {
		return raw === undefined ? NaN : Number(raw.replace(/\s/g, '').replace(',', '.'));
	}

	private static async fetchAndDecode(url: string): Promise<string> {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`CBR request failed (${res.status}): ${url}`);
		}
		const buffer = await res.arrayBuffer();
		return new TextDecoder('windows-1251').decode(buffer);
	}

	// https://www.cbr.ru/scripts/XML_daily.asp — курсы всех валют на дату (по умолчанию — сегодня).
	static async fetchDailyCurrencies(date?: Date): Promise<CbrCurrencyRate[]> {
		const url = date
			? `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${ServiceCbr.formatDate(date)}`
			: 'https://www.cbr.ru/scripts/XML_daily.asp';
		const xml = await ServiceCbr.fetchAndDecode(url);

		const dateMatch = xml.match(/<ValCurs Date="([^"]+)"/);
		const isoDate = dateMatch ? dateMatch[1].split('.').reverse().join('-') : '';

		return Array.from(xml.matchAll(/<Valute ID="([^"]+)">([\s\S]*?)<\/Valute>/g)).map((match) => {
			const [, id, body] = match;
			const numCode = body.match(/<NumCode>([^<]*)<\/NumCode>/)?.[1] ?? '';
			const charCode = body.match(/<CharCode>([^<]*)<\/CharCode>/)?.[1] ?? '';
			const nominal = ServiceCbr.parseNumber(body.match(/<Nominal>([^<]*)<\/Nominal>/)?.[1]);
			const name = body.match(/<Name>([^<]*)<\/Name>/)?.[1] ?? null;
			const value = ServiceCbr.parseNumber(body.match(/<Value>([^<]*)<\/Value>/)?.[1]);

			return { id, numCode, charCode, nominal, name, value, date: isoDate };
		});
	}

	// https://www.cbr.ru/scripts/XML_dynamic.asp — динамика одной валюты за период (валютные ID — см. R01235=USD, R01239=EUR, R01035=CNY, ...).
	static async fetchCurrencyHistory(
		currencyId: string,
		dateFrom: Date,
		dateTo: Date
	): Promise<CbrCurrencyRate[]> {
		const url =
			'https://www.cbr.ru/scripts/XML_dynamic.asp' +
			`?date_req1=${ServiceCbr.formatDate(dateFrom)}` +
			`&date_req2=${ServiceCbr.formatDate(dateTo)}` +
			`&VAL_NM_RQ=${currencyId}`;
		const xml = await ServiceCbr.fetchAndDecode(url);

		return Array.from(xml.matchAll(/<Record Date="([^"]+)"[^>]*>([\s\S]*?)<\/Record>/g)).map(
			(match) => {
				const [, rawDate, body] = match;
				const nominal = ServiceCbr.parseNumber(body.match(/<Nominal>([^<]*)<\/Nominal>/)?.[1]);
				const value = ServiceCbr.parseNumber(body.match(/<Value>([^<]*)<\/Value>/)?.[1]);

				return {
					id: currencyId,
					numCode: '',
					charCode: '',
					nominal,
					name: null,
					value,
					date: rawDate.split('.').reverse().join('-')
				};
			}
		);
	}

	// https://www.cbr.ru/scripts/xml_metall.asp — учётные цены Au/Ag/Pt/Pd за период (Code 1..4).
	static async fetchMetals(dateFrom: Date, dateTo: Date): Promise<CbrMetalRate[]> {
		const url =
			'https://www.cbr.ru/scripts/xml_metall.asp' +
			`?date_req1=${ServiceCbr.formatDate(dateFrom)}` +
			`&date_req2=${ServiceCbr.formatDate(dateTo)}`;
		const xml = await ServiceCbr.fetchAndDecode(url);

		return Array.from(
			xml.matchAll(/<Record Date="([^"]+)" Code="([^"]+)">([\s\S]*?)<\/Record>/g)
		).flatMap((match) => {
			const [, rawDate, code, body] = match;
			const metal = METAL_BY_CODE[code];
			if (!metal) return [];

			const buy = ServiceCbr.parseNumber(body.match(/<Buy>([^<]*)<\/Buy>/)?.[1]);
			const sell = ServiceCbr.parseNumber(body.match(/<Sell>([^<]*)<\/Sell>/)?.[1]);

			return [{ metal, date: rawDate.split('.').reverse().join('-'), buy, sell }];
		});
	}
}
