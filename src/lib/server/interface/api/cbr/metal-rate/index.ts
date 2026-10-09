// Parsed row from CBR RF xml_metall.asp (https://www.cbr.ru/scripts/xml_metall.asp) — учётные цены на драгметаллы.
export interface CbrMetalRate {
	metal: 'gold' | 'silver' | 'platinum' | 'palladium';
	date: string;
	buy: number;
	sell: number;
}
