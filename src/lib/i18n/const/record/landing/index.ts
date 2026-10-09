import type { RecipeLandingPage } from '$stylist/wbd/interface/recipe/landing-page';
import { ObjectLandingRu } from '$lib/i18n/const/object/landing/ru';
import { ObjectLandingEn } from '$lib/i18n/const/object/landing/en';
import { ObjectLandingEs } from '$lib/i18n/const/object/landing/es';

export const RecordLandingTranslation: Record<string, RecipeLandingPage> = {
	ru: ObjectLandingRu,
	en: ObjectLandingEn,
	es: ObjectLandingEs
};
