<script lang="ts">
	import { page } from '$app/state';
	import BrandLogo from '$lib/brand-logo.svelte';
	import LanguageControl from '$lib/wbd/language-control.svelte';
	import { ObjectLanding } from '$lib/i18n/const/object/landing';
	import WbdLandingPage from '$stylist/wbd/component/template/wbd-landing-page/index.svelte';

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

	const imageAlt: Record<
		string,
		{ hero: string; definition: string; workflow: string; intro: string; result: string }
	> = {
		ru: {
			hero: 'Аналитическая комната принятия решений с панелью экспертного консенсуса',
			definition: 'Схема сведения независимых экспертных прогнозов в единую воронку консенсуса',
			workflow: 'Схема сужения оценок экспертов по раундам Wideband Delphi к устойчивому диапазону',
			intro: 'Историческая комната прогнозирования с картой мира и постами аналитиков — истоки метода Дельфи',
			result: 'Цифровой документ для принятия решения с диапазонами, рисками и итоговым консенсусом'
		},
		en: {
			hero: 'Analytics decision room with an expert consensus dashboard',
			definition: 'Diagram of independent expert forecasts converging into a single consensus funnel',
			workflow: 'Diagram of expert estimates narrowing round by round in Wideband Delphi to a stable range',
			intro: 'A historic forecasting war room with a world map and analyst desks — the origins of the Delphi method',
			result: 'Digital decision brief with ranges, risks, and the final consensus'
		},
		es: {
			hero: 'Sala de decisiones analítica con un panel de consenso experto',
			definition:
				'Diagrama de pronósticos expertos independientes convergiendo en un único embudo de consenso',
			workflow:
				'Diagrama de estimaciones expertas que se estrechan ronda a ronda en Wideband Delphi hasta un rango estable',
			intro: 'Una sala de pronóstico histórica con un mapa mundial y puestos de analistas — los orígenes del método Delphi',
			result: 'Brief de decisión digital con rangos, riesgos y el consenso final'
		}
	};

	const currentLang = $derived((page.data as { lang?: string }).lang ?? 'en');
	const content = $derived(ObjectLanding[currentLang] ?? ObjectLanding.en);
	const alt = $derived(imageAlt[currentLang] ?? imageAlt.en);
	const fallbackPublicPolls = $derived.by((): PublicPoll[] => {
		if (currentLang === 'ru') {
			return [
				{
					id: 'market-entry-timing',
					text: 'Срок выхода на рынок',
					body: 'Оцените оптимальное окно запуска промышленного аналитического продукта в условиях неопределённого спроса.',
					imageSrc: '/gen/case-technology-maturity-tree.png',
					imageAlt: 'Карта зрелости технологий с экспертными оценками',
					href: '/public/invite/market-entry-timing',
					meta: '8 вопросов',
					status: 'открыт / раунд 1 из 3'
				},
				{
					id: 'capex-readiness',
					text: 'Готовность CAPEX-проекта',
					body: 'Соберите независимые мнения о составе работ, сроках и готовности инвестзаявки до комитета.',
					imageSrc: '/gen/case-capex-project-estimation.png',
					imageAlt: 'Панель планирования капитального проекта',
					href: '/public/invite/capex-readiness',
					meta: '12 вопросов',
					status: 'открыт / раунд 2 из 3'
				},
				{
					id: 'price-corridor',
					text: 'Коридор долгосрочной цены',
					body: 'Сравните ценовые сценарии и ключевые факторы неопределённости через публичную экспертную оценку.',
					imageSrc: '/gen/case-price-corridor-contracts.png',
					imageAlt: 'Аналитический экран ценового коридора',
					href: '/public/invite/price-corridor',
					meta: '6 вопросов',
					status: 'сбор экспертов'
				}
			];
		}
		if (currentLang === 'es') {
			return [
				{
					id: 'market-entry-timing',
					text: 'Momento de entrada al mercado',
					body: 'Estima la ventana adecuada para lanzar un producto analítico industrial bajo demanda incierta.',
					imageSrc: '/gen/case-technology-maturity-tree.png',
					imageAlt: 'Mapa de madurez tecnológica con estimaciones expertas',
					href: '/public/invite/market-entry-timing',
					meta: '8 preguntas',
					status: 'abierta / ronda 1 de 3'
				},
				{
					id: 'capex-readiness',
					text: 'Preparación de CAPEX',
					body: 'Reúne opiniones independientes sobre alcance, plazos y preparación antes del comité.',
					imageSrc: '/gen/case-capex-project-estimation.png',
					imageAlt: 'Panel de planificación de proyecto de capital',
					href: '/public/invite/capex-readiness',
					meta: '12 preguntas',
					status: 'abierta / ronda 2 de 3'
				},
				{
					id: 'price-corridor',
					text: 'Corredor de precio a largo plazo',
					body: 'Compara escenarios de precio y factores clave de incertidumbre con juicio experto público.',
					imageSrc: '/gen/case-price-corridor-contracts.png',
					imageAlt: 'Pantalla analítica de corredor de precios',
					href: '/public/invite/price-corridor',
					meta: '6 preguntas',
					status: 'captando expertos'
				}
			];
		}
		return [
			{
				id: 'market-entry-timing',
				text: 'Market entry timing',
				body: 'Estimate the right launch window for a new industrial analytics product under uncertain demand.',
				imageSrc: '/gen/case-technology-maturity-tree.png',
				imageAlt: 'Technology maturity map with expert estimates',
				href: '/public/invite/market-entry-timing',
				meta: '8 questions',
				status: 'open / round 1 of 3'
			},
			{
				id: 'capex-readiness',
				text: 'CAPEX readiness poll',
				body: 'Collect independent views on scope, schedule, and investment readiness before committee review.',
				imageSrc: '/gen/case-capex-project-estimation.png',
				imageAlt: 'Capital project planning dashboard',
				href: '/public/invite/capex-readiness',
				meta: '12 questions',
				status: 'open / round 2 of 3'
			},
			{
				id: 'price-corridor',
				text: 'Long-term price corridor',
				body: 'Use public expert judgment to compare price scenarios and key uncertainty drivers.',
				imageSrc: '/gen/case-price-corridor-contracts.png',
				imageAlt: 'Price corridor analytics screen',
				href: '/public/invite/price-corridor',
				meta: '6 questions',
				status: 'collecting experts'
			}
		];
	});
	const loadedPublicPolls = $derived(
		((page.data as { publicPolls?: PublicPoll[] }).publicPolls ?? []) as PublicPoll[]
	);
	const publicPolls = $derived(
		loadedPublicPolls.length ? loadedPublicPolls : (content.publicPolls ?? fallbackPublicPolls)
	);
</script>

<WbdLandingPage
	{content}
	heroImageSrc="/landing/1-hero-consensus-decision-room.png"
	heroImageAlt={alt.hero}
	definitionImageSrc="/landing/2-section-about.png"
	definitionImageAlt={alt.definition}
	workflowImageSrc="/landing/3-section-wideband-delphi.png"
	workflowImageAlt={alt.workflow}
	introImageSrc="/landing/4-section-history.png"
	introImageAlt={alt.intro}
	resultImageSrc="/gen/result-consensus-decision-brief.png"
	resultImageAlt={alt.result}
	{publicPolls}
>
	{#snippet brand()}
		<BrandLogo class="nav__brand" href="/" size="1.75rem" />
	{/snippet}
	{#snippet languageControl()}
		<LanguageControl />
	{/snippet}
</WbdLandingPage>
