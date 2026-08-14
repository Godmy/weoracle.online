import type { LayoutServerLoad } from './$types';
import { detectLanguageFromHeader, isSupportedLanguage, loadTranslations } from '$lib/server/wbd/i18n';

const COOKIE = 'wbd_lang';

export const load: LayoutServerLoad = async (event) => {
	const { cookies, request } = event;
	const cookieLang = cookies.get(COOKIE);
	const lang = isSupportedLanguage(cookieLang)
		? cookieLang
		: detectLanguageFromHeader(request.headers.get('accept-language'));

	const db = event.platform?.env?.DB;
	const translations = db ? await loadTranslations(db, lang).catch(() => ({})) : {};
	return { lang, translations };
};
