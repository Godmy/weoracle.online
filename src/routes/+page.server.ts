import type { PageServerLoad } from './$types';

type LandingLanguage = 'ru' | 'en' | 'es';

type PublicPollRow = {
	id: string;
	title: string;
	description: string | null;
	image_url: string | null;
	status: string;
	current_round: number;
	max_rounds: number;
	question_count: number;
};

type PublicPoll = {
	id: string;
	text: string;
	body?: string;
	imageSrc: string;
	imageAlt: string;
	href: string;
	meta?: string;
	status?: string;
};

const pollBodyFallback: Record<string, Record<LandingLanguage, string>> = {
	'406f8a5a-6b2f-4a14-9694-5bf017ee3c67': {
		ru: 'Публичный экспертный прогноз о том, как ИИ изменит занятость, роли и спрос на навыки.',
		en: 'A public expert forecast on how AI will change jobs, roles, and skill demand.',
		es: 'Un pronóstico experto público sobre cómo la IA cambiará empleo, roles y demanda de habilidades.'
	},
	'd234194b-921d-41bc-aa79-4825b18e8a23': {
		ru: 'Оценка возможного диапазона курса рубля к доллару с фиксацией ключевых факторов неопределенности.',
		en: 'An estimate of the possible RUB/USD range with key uncertainty drivers captured.',
		es: 'Una estimación del rango posible RUB/USD con factores clave de incertidumbre.'
	},
	'3d245fd6-013b-4ade-919c-2c407c2c6135': {
		ru: 'Экспертный опрос о региональной динамике цен на бензин и причинах возможных отклонений.',
		en: 'An expert poll on regional fuel price dynamics and possible deviation drivers.',
		es: 'Una encuesta experta sobre precios regionales de combustible y posibles desviaciones.'
	}
};

function normalizeLanguage(value: unknown): LandingLanguage {
	return value === 'ru' || value === 'es' ? value : 'en';
}

function formatQuestionCount(count: number, lang: LandingLanguage): string {
	if (lang === 'ru') {
		const mod10 = count % 10;
		const mod100 = count % 100;
		const word =
			mod10 === 1 && mod100 !== 11
				? 'вопрос'
				: mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
					? 'вопроса'
					: 'вопросов';
		return `${count} ${word}`;
	}
	if (lang === 'es') return `${count} preguntas`;
	return `${count} questions`;
}

function formatStatus(row: PublicPollRow, lang: LandingLanguage): string {
	if (lang === 'ru') {
		const status = row.status === 'draft' ? 'подготовка' : row.status.replaceAll('_', ' ');
		const round =
			row.current_round > 0 ? `раунд ${row.current_round} из ${row.max_rounds}` : `${row.max_rounds} раунда`;
		return `${status} / ${round}`;
	}
	if (lang === 'es') {
		const status = row.status === 'draft' ? 'preparación' : row.status.replaceAll('_', ' ');
		const round =
			row.current_round > 0 ? `ronda ${row.current_round} de ${row.max_rounds}` : `${row.max_rounds} rondas`;
		return `${status} / ${round}`;
	}
	const status = row.status === 'draft' ? 'preparing' : row.status.replaceAll('_', ' ');
	const round =
		row.current_round > 0 ? `round ${row.current_round} of ${row.max_rounds}` : `${row.max_rounds} rounds`;
	return `${status} / ${round}`;
}

export const load: PageServerLoad = async (event) => {
	const { lang: parentLang } = await event.parent();
	const lang = normalizeLanguage(parentLang);
	const db = event.platform?.env?.DB;
	if (!db) {
		return { publicPolls: [] };
	}

	const { results } = await db
		.prepare(
			`
			SELECT
				s.id,
				s.title,
				s.description,
				s.image_url,
				s.status,
				s.current_round,
				s.max_rounds,
				(SELECT COUNT(*) FROM wbd_questions q WHERE q.session_id = s.id) AS question_count
			FROM wbd_sessions s
			WHERE s.is_public = 1
			ORDER BY s.created_at DESC
			LIMIT 6
		`
		)
		.all<PublicPollRow>()
		.catch(() => ({ results: [] as PublicPollRow[] }));

	const publicPolls: PublicPoll[] = results.map((row: PublicPollRow) => ({
		id: row.id,
		text: row.title,
		body: row.description ?? pollBodyFallback[row.id]?.[lang],
		imageSrc: row.image_url ?? '/gen/process-wideband-delphi-flow.png',
		imageAlt: row.title,
		href: `/public/invite/${row.id}`,
		meta: formatQuestionCount(row.question_count, lang),
		status: formatStatus(row, lang)
	}));

	return { publicPolls };
};
