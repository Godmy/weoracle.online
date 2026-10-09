// Parsed row from CBR RF XML_daily.asp / XML_dynamic.asp (https://www.cbr.ru/scripts/XML_daily.asp).
export interface CbrCurrencyRate {
	id: string;
	numCode: string;
	charCode: string;
	nominal: number;
	name: string | null;
	value: number;
	date: string;
}
