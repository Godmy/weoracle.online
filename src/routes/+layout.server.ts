import type { LayoutServerLoad } from './$types';
import { ManagerTranslation } from '$lib/server/class/manager/translation';

const COOKIE = 'wbd_lang';

export const load: LayoutServerLoad = async (event) => {
	const { cookies, request } = event;
	const cookieLang = cookies.get(COOKIE);
	const lang = ManagerTranslation.isSupported(cookieLang)
		? cookieLang
		: ManagerTranslation.detectFromHeader(request.headers.get('accept-language'));

	const db = event.platform?.env?.DB;
	const translations = db ? await ManagerTranslation.load(db, lang).catch(() => ({})) : {};
	return { lang, translations };
};
