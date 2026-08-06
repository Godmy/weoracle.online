import type { D1Like } from '$lib/server/wbd/db';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function isSupportedLanguage(value: string | undefined | null): value is SupportedLanguage {
	return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** All `wbd_translations` rows for `lang`, with any key missing in `lang` filled in from `DEFAULT_LANGUAGE`. */
export async function loadTranslations(db: D1Like, lang: SupportedLanguage): Promise<Record<string, string>> {
	const { results } = await db
		.prepare(`SELECT key, lang, value FROM wbd_translations WHERE lang = ?1 OR lang = ?2`)
		.bind(lang, DEFAULT_LANGUAGE)
		.all<{ key: string; lang: string; value: string }>();

	const translations: Record<string, string> = {};
	for (const row of results) {
		if (row.lang === DEFAULT_LANGUAGE) translations[row.key] = row.value;
	}
	for (const row of results) {
		if (row.lang === lang) translations[row.key] = row.value;
	}
	return translations;
}
