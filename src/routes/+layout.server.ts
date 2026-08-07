import type { LayoutServerLoad } from './$types';
import { detectLanguageFromHeader, isSupportedLanguage, loadTranslations } from '$lib/server/wbd/i18n';

const COOKIE = 'wbd_lang';

export const load: LayoutServerLoad = async ({ cookies, platform, request }) => {
	const cookieLang = cookies.get(COOKIE);
	const lang = isSupportedLanguage(cookieLang)
		? cookieLang
		: detectLanguageFromHeader(request.headers.get('accept-language'));
	const translations = await loadTranslations(platform!.env.DB, lang);
	return { lang, translations };
};
