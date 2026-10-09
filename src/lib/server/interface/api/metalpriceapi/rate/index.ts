// Parsed row from MetalpriceAPI /v1/timeframe (https://metalpriceapi.com/documentation) — price of 1 unit of `symbol` in `base`.
export interface MetalpriceApiRate {
	date: string;
	symbol: 'XAU' | 'XAG' | 'XPT' | 'XPD';
	base: string;
	rate: number;
}
