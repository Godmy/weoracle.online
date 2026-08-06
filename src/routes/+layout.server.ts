import type { LayoutServerLoad } from './$types';
import { DEFAULT_LANGUAGE, isSupportedLanguage, loadTranslations } from '$lib/server/wbd/i18n';

const COOKIE = 'wbd_lang';

export const load: LayoutServerLoad = async ({ cookies, platform }) => {
	const cookieLang = cookies.get(COOKIE);
	const lang = isSupportedLanguage(cookieLang) ? cookieLang : DEFAULT_LANGUAGE;
	const translations = await loadTranslations(platform!.env.DB, lang);
	return { lang, translations };
};
