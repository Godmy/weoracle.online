import type { D1Like } from '$lib/server/wbd/db';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function isSupportedLanguage(value: string | undefined | null): value is SupportedLanguage {
	return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Picks the best supported language from an `Accept-Language` header (e.g. "ru-RU,ru;q=0.9,en;q=0.8"),
 * used only as a first-visit fallback before the user has an explicit `wbd_lang` cookie.
 */
export function detectLanguageFromHeader(header: string | null): SupportedLanguage {
	if (!header) return DEFAULT_LANGUAGE;
	const ranked = header
		.split(',')
		.map((part) => {
			const [tag, qValue] = part.trim().split(';q=');
			const q = qValue ? parseFloat(qValue) : 1;
			return { primary: tag.trim().toLowerCase().split('-')[0], q: Number.isFinite(q) ? q : 1 };
		})
		.sort((a, b) => b.q - a.q);
	for (const { primary } of ranked) {
		if (isSupportedLanguage(primary)) return primary;
	}
	return DEFAULT_LANGUAGE;
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
