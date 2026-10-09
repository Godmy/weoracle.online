// Parsed row from ECB eurofxref-daily.xml / eurofxref-hist(-90d).xml — reference rate vs EUR.
export interface EcbCurrencyRate {
	currency: string;
	rate: number;
	date: string;
}
