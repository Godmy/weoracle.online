import type { MetalpriceApiRate } from '$lib/server/interface/api/metalpriceapi/rate';

interface TimeframeResponse {
	success: boolean;
	error?: { statusCode: number; message: string };
	rates?: Record<string, Record<string, number>>;
}

const MAX_WINDOW_DAYS = 365;

// MetalpriceAPI (https://metalpriceapi.com) — курсы драгметаллов, free tier: 100 запросов/мес.
// /timeframe формально поддерживает диапазон до 365 дней, но на free-плане — ровно один symbol
// за запрос (несколько сразу — 412 "requires a paid plan") И глубина ограничена последними
// 30 днями (409/209 "Querying older than 30 days requires a paid plan" — проверено вживую,
// в общей доке это не написано). Поэтому MAX_WINDOW_DAYS=365 здесь не спасает: для истории
// глубже месяца нужен платный план. Для 1-2 лет по металлам используем class/service/cbr
// (RUB/грамм, реальная история уже в data/json/cbr/{xau,xag,xpt,xpd}.json) — этот сервис
// оставлен для текущей/недавней (≤30 дней) цены в USD за тройскую унцию.
// Ответ даёт rate как "symbol per 1 base" (обратная цена), нам нужно поле `${base}${symbol}` —
// это уже "base per 1 symbol", то, как обычно котируют металл (например USDXAU = $/oz золота).
export class ServiceMetalpriceApi {
	private static isoDate(date: Date): string {
		return date.toISOString().slice(0, 10);
	}

	private static addDays(date: Date, days: number): Date {
		const next = new Date(date);
		next.setUTCDate(next.getUTCDate() + days);
		return next;
	}

	private static splitWindows(from: Date, to: Date): [Date, Date][] {
		const windows: [Date, Date][] = [];
		let windowStart = from;
		while (windowStart < to) {
			const windowEnd = new Date(
				Math.min(ServiceMetalpriceApi.addDays(windowStart, MAX_WINDOW_DAYS - 1).getTime(), to.getTime())
			);
			windows.push([windowStart, windowEnd]);
			windowStart = ServiceMetalpriceApi.addDays(windowEnd, 1);
		}
		return windows;
	}

	private static async fetchWindow(
		symbol: string,
		from: Date,
		to: Date,
		apiKey: string,
		base: string
	): Promise<MetalpriceApiRate[]> {
		const params = new URLSearchParams({
			api_key: apiKey,
			start_date: ServiceMetalpriceApi.isoDate(from),
			end_date: ServiceMetalpriceApi.isoDate(to),
			base,
			currencies: symbol
		});

		const res = await fetch(`https://api.metalpriceapi.com/v1/timeframe?${params}`);
		const body = (await res.json()) as TimeframeResponse;

		if (!res.ok || !body.success || !body.rates) {
			throw new Error(
				`MetalpriceAPI request failed (${body.error?.statusCode ?? res.status}): ${body.error?.message ?? res.statusText}`
			);
		}

		return Object.entries(body.rates).flatMap(([date, dayRates]) => {
			const rate = dayRates[`${base}${symbol}`];
			if (rate === undefined) return [];
			return [{ date, symbol: symbol as MetalpriceApiRate['symbol'], base, rate }];
		});
	}

	// Диапазон произвольной длины, несколько symbols — сам режет по MAX_WINDOW_DAYS и по одному
	// symbol на запрос, шлёт последовательно (symbols.length * ceil(days/365) запросов).
	static async fetchTimeframe(
		symbols: string[],
		from: Date,
		to: Date,
		apiKey: string,
		base = 'USD'
	): Promise<MetalpriceApiRate[]> {
		const windows = ServiceMetalpriceApi.splitWindows(from, to);
		const results: MetalpriceApiRate[] = [];
		for (const symbol of symbols) {
			for (const [windowFrom, windowTo] of windows) {
				results.push(...(await ServiceMetalpriceApi.fetchWindow(symbol, windowFrom, windowTo, apiKey, base)));
			}
		}
		return results;
	}
}
