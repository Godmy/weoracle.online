import type { LandingPageContent } from 'stylist-svelte';

export const ObjectLanding: Record<string, LandingPageContent> = {
	ru: {
		metaTitle: 'WeOracle — Wideband Delphi для управленческих решений',
		metaDescription:
			'WeOracle помогает собрать анонимный экспертный консенсус по CAPEX, технологиям, бюджету, контрактным ценам и промышленным графикам.',
		nav: { cases: 'Кейсы', method: 'Метод', about: 'О методе', signIn: 'Войти' },
		hero: {
			eyebrow: 'Wideband Delphi platform',
			title: 'Экспертный консенсус для решений, где ошибка стоит дорого',
			lead: 'WeOracle собирает независимые оценки профильных экспертов, показывает расхождения и превращает неопределенность в диапазоны, приоритеты и решение для комитета.',
			create: 'Создать сессию',
			cases: 'Смотреть кейсы'
		},
		metrics: [
			['3 раунда', 'достаточно, чтобы снять шум и увидеть устойчивый консенсус'],
			['P10-P90', 'диапазоны вместо одной декоративно точной цифры'],
			['Анонимно', 'эксперты говорят о рисках без карьерного давления']
		],
		definition: {
			eyebrow: 'Что это такое',
			title: 'Wideband Delphi: коллективный прогноз без иллюзий консенсуса',
			paragraphs: [
				'Wideband Delphi — метод получения группового прогноза или экспертной оценки, при котором участники отвечают анонимно, видят разброс чужих мнений и уточняют свою позицию в несколько раундов. Здесь никто не давит авторитетом и не подстраивается под первого высказавшегося: итоговая оценка формируется через осознанное сближение позиций — или честную фиксацию несогласия.',
				'Название пришло из IT: метод изначально использовался для оценки сроков разработки ПО, где «wideband» — широкий диапазон оценки (минимум–ожидаемое–максимум), а «Delphi» — отсылка к древнегреческому оракулу. Сегодня метод применяется везде, где нужен прогноз в условиях неопределённости: экономика, рынок труда, цены, технологии, социальные тренды.'
			],
			comparisonTitle: 'Почему это лучше, чем обычный опрос или голосование',
			comparisonColumns: ['Обычный опрос', 'Открытая дискуссия', 'Wideband Delphi'],
			comparisonCriteria: [
				'Анонимность',
				'Учёт неопределённости',
				'Защита от эффекта первого мнения',
				'Пересмотр позиции с аргументами',
				'Видимость расхождений'
			],
			comparisonRows: [
				['Обычно нет', 'Нет', 'Да'],
				['Нет', 'Иногда', 'Да (диапазон min–max)'],
				['Нет', 'Нет', 'Да'],
				['Нет', 'Частично', 'Да, структурировано'],
				['Скрыта в среднем', 'Видна, но хаотично', 'Видна и структурирована']
			]
		},
		intro: {
			eyebrow: 'Decision intelligence',
			title: 'Не опрос ради опроса, а управленческий артефакт',
			body: 'Когда исторических данных мало, участники защищают свои планы, а внешние прогнозы расходятся, одна экспертная позиция не закрывает риск. WeOracle фиксирует независимые оценки, подсвечивает конфликт допущений и доводит группу до прозрачного решения.'
		},
		casesHeading: { eyebrow: 'TOP-5 use cases', title: 'Где метод дает самый понятный эффект' },
		cases: [
			{
				kicker: '01 / Capital projects',
				title: 'Оценка CAPEX и сроков крупных проектов',
				body: 'Соберите независимый консенсус инженеров, снабжения, проектного офиса и финансов до решения инвесткомитета.',
				result: 'Диапазон CAPEX, сроков, критических зависимостей и факторов отклонения.',
				image: '/gen/case-capex-project-estimation.png',
				alt: 'Панель планирования крупного промышленного проекта с моделью объекта и графиками сроков'
			},
			{
				kicker: '02 / Technology roadmap',
				title: 'Прогноз создания и зрелости технологий',
				body: 'Оцените, какие технологии действительно созреют, когда станут применимыми и какие барьеры нужно снять.',
				result: 'Карта зрелости, вероятность технического успеха, сроки и стоимость доведения.',
				image: '/gen/case-technology-maturity-tree.png',
				alt: 'Иерархическая карта технологических целей с экспертными оценками зрелости'
			},
			{
				kicker: '03 / Resource allocation',
				title: 'Распределение бюджета между инициативами',
				body: 'Превратите конкурирующие заявки подразделений в приоритетный портфель на основе анонимной экспертной оценки.',
				result:
					'Рекомендуемое распределение бюджета, priority score и сценарии при разных лимитах.',
				image: '/gen/case-budget-portfolio-allocation.png',
				alt: 'Интерфейс портфельного распределения бюджета между стратегическими инициативами'
			},
			{
				kicker: '04 / Long-term contracts',
				title: 'Прогноз ценовых коридоров для контрактов',
				body: 'Получите рабочий диапазон цены для LTA, закупок и переговоров, не полагаясь на один прогноз.',
				result: 'Ценовой коридор, сценарные границы и условия пересмотра контрактной формулы.',
				image: '/gen/case-price-corridor-contracts.png',
				alt: 'Аналитический экран с коридором цен и сценарными линиями для долгосрочного контракта'
			},
			{
				kicker: '05 / Turnaround',
				title: 'График капитальных ремонтов и остановов',
				body: 'Согласуйте реалистичное окно ремонта между производством, подрядчиками, снабжением и финансами.',
				result: 'Критический путь, риски сокращения сроков и цена каждого компромисса.',
				image: '/gen/case-turnaround-schedule.png',
				alt: 'Промышленная панель планирования капитального ремонта с временной шкалой и зависимостями'
			}
		],
		workflow: {
			eyebrow: 'How it works',
			title: 'Пять шагов от разрозненных мнений к диапазону решения',
			steps: [
				'Фасилитатор задает вопрос, шкалы оценки, участников и критерии консенсуса.',
				'Эксперты независимо дают трехточечные оценки, аргументы и допущения.',
				'WeOracle агрегирует ответы, показывает разброс и зоны расхождения.',
				'После обсуждения спорных зон проходит следующий раунд уточнения.',
				'Команда получает диапазон, приоритеты, риски и decision brief для комитета.'
			]
		},
		result: {
			eyebrow: 'Final output',
			title: 'На выходе не чат и не таблица, а brief для решения',
			body: 'Финальный результат можно обсуждать на инвесткомитете, бюджетной сессии, технологическом совете или операционном штабе: диапазоны, аргументы, спорные допущения, риски и рекомендуемые действия собраны в один документ.',
			cta: 'Перейти в WeOracle'
		},
		labels: {
			nav: 'Основная навигация',
			metrics: 'Ключевые свойства метода',
			definition: 'Что такое Wideband Delphi',
			cases: 'Кейсы WeOracle',
			workflow: 'Процесс Wideband Delphi',
			result: 'Результат сессии'
		}
	},
	en: {
		metaTitle: 'WeOracle — Wideband Delphi for executive decisions',
		metaDescription:
			'WeOracle gathers anonymous expert consensus for CAPEX, technology roadmaps, budgets, contract prices, and industrial schedules.',
		nav: { cases: 'Cases', method: 'Method', about: 'About', signIn: 'Sign in' },
		hero: {
			eyebrow: 'Wideband Delphi platform',
			title: 'Expert consensus for decisions where mistakes are expensive',
			lead: 'WeOracle gathers independent estimates from domain experts, exposes disagreement, and turns uncertainty into ranges, priorities, and a committee-ready decision.',
			create: 'Create session',
			cases: 'View cases'
		},
		metrics: [
			['3 rounds', 'enough structure to reduce noise and reveal stable consensus'],
			['P10-P90', 'decision ranges instead of one decorative precise number'],
			['Anonymous', 'experts can name risks without career pressure']
		],
		definition: {
			eyebrow: 'What it is',
			title: 'Wideband Delphi: a collective forecast without the illusion of consensus',
			paragraphs: [
				'Wideband Delphi is a method for producing a group forecast or expert estimate in which participants respond anonymously, see the spread of other opinions, and refine their position over several rounds. No one is pressured by authority or anchored to whoever spoke first — the final estimate forms through deliberate convergence, or an honest record of disagreement.',
				'The name comes from software engineering: the method was originally used to estimate development timelines, where "wideband" means a wide estimation range (minimum-expected-maximum), and "Delphi" refers to the ancient Greek oracle. Today it is used anywhere a forecast is needed under uncertainty: economics, labor markets, pricing, technology, social trends.'
			],
			comparisonTitle: 'Why it beats a regular poll or a vote',
			comparisonColumns: ['Regular poll', 'Open discussion', 'Wideband Delphi'],
			comparisonCriteria: [
				'Anonymity',
				'Accounts for uncertainty',
				'Protection from anchoring',
				'Revising a position with evidence',
				'Visibility of disagreement'
			],
			comparisonRows: [
				['Usually not', 'No', 'Yes'],
				['No', 'Sometimes', 'Yes (min-max range)'],
				['No', 'No', 'Yes'],
				['No', 'Partially', 'Yes, structured'],
				['Hidden in the average', 'Visible, but chaotic', 'Visible and structured']
			]
		},
		intro: {
			eyebrow: 'Decision intelligence',
			title: 'Not a survey. A decision artifact.',
			body: 'When history is thin, teams defend their plans, and external forecasts diverge, one expert opinion is not enough. WeOracle captures independent estimates, highlights conflicting assumptions, and guides the group toward a transparent decision.'
		},
		casesHeading: { eyebrow: 'TOP-5 use cases', title: 'Where the method is easiest to value' },
		cases: [
			{
				kicker: '01 / Capital projects',
				title: 'CAPEX and schedule estimates for major projects',
				body: 'Gather independent consensus from engineering, procurement, project controls, and finance before the investment committee.',
				result: 'CAPEX range, schedule range, critical dependencies, and key deviation drivers.',
				image: '/gen/case-capex-project-estimation.png',
				alt: 'Capital project planning dashboard with a facility model and schedule analytics'
			},
			{
				kicker: '02 / Technology roadmap',
				title: 'Technology maturity and creation forecasts',
				body: 'Estimate which technologies will mature, when they become usable, and which barriers must be removed.',
				result:
					'Maturity map, technical success probability, time-to-readiness, and cost to advance.',
				image: '/gen/case-technology-maturity-tree.png',
				alt: 'Technology goal tree with expert maturity and feasibility indicators'
			},
			{
				kicker: '03 / Resource allocation',
				title: 'Budget allocation across strategic initiatives',
				body: 'Turn competing department requests into a prioritized portfolio based on anonymous expert judgment.',
				result:
					'Recommended budget allocation, priority scores, and scenarios for different limits.',
				image: '/gen/case-budget-portfolio-allocation.png',
				alt: 'Portfolio allocation interface for strategic initiatives'
			},
			{
				kicker: '04 / Long-term contracts',
				title: 'Price corridors for long-term contracts',
				body: 'Use a working price range for LTA, procurement, and negotiation instead of relying on one forecast.',
				result: 'Price corridor, scenario boundaries, and contract formula review triggers.',
				image: '/gen/case-price-corridor-contracts.png',
				alt: 'Analytics screen with price corridor and scenario curves for a long-term contract'
			},
			{
				kicker: '05 / Turnaround',
				title: 'Maintenance shutdown and turnaround schedules',
				body: 'Align a realistic maintenance window across production, contractors, procurement, and finance.',
				result: 'Critical path, schedule compression risks, and the cost of each compromise.',
				image: '/gen/case-turnaround-schedule.png',
				alt: 'Industrial maintenance planning dashboard with timeline and dependencies'
			}
		],
		workflow: {
			eyebrow: 'How it works',
			title: 'Five steps from scattered estimates to a decision range',
			steps: [
				'The facilitator defines the question, scales, participants, and consensus criteria.',
				'Experts independently submit three-point estimates, rationale, and assumptions.',
				'WeOracle aggregates answers and highlights spread and disagreement hotspots.',
				'After focused discussion, the next round refines the disputed estimates.',
				'The team receives ranges, priorities, risks, and a committee-ready decision brief.'
			]
		},
		result: {
			eyebrow: 'Final output',
			title: 'The output is not a chat or spreadsheet. It is a decision brief.',
			body: 'The final result is usable in an investment committee, budget session, technology council, or operations review: ranges, rationale, contested assumptions, risks, and recommended actions in one document.',
			cta: 'Open WeOracle'
		},
		labels: {
			nav: 'Primary navigation',
			metrics: 'Core method properties',
			definition: 'What Wideband Delphi is',
			cases: 'WeOracle cases',
			workflow: 'Wideband Delphi process',
			result: 'Session result'
		}
	},
	es: {
		metaTitle: 'WeOracle — Wideband Delphi para decisiones ejecutivas',
		metaDescription:
			'WeOracle reúne consenso experto anónimo para CAPEX, tecnología, presupuestos, precios contractuales y cronogramas industriales.',
		nav: { cases: 'Casos', method: 'Método', about: 'Sobre el método', signIn: 'Entrar' },
		hero: {
			eyebrow: 'Plataforma Wideband Delphi',
			title: 'Consenso experto para decisiones donde equivocarse cuesta caro',
			lead: 'WeOracle reúne estimaciones independientes de expertos, muestra desacuerdos y convierte la incertidumbre en rangos, prioridades y una decisión lista para comité.',
			create: 'Crear sesión',
			cases: 'Ver casos'
		},
		metrics: [
			['3 rondas', 'estructura suficiente para reducir ruido y revelar consenso estable'],
			['P10-P90', 'rangos de decisión en lugar de una sola cifra decorativamente precisa'],
			['Anónimo', 'los expertos pueden señalar riesgos sin presión profesional']
		],
		definition: {
			eyebrow: 'Qué es',
			title: 'Wideband Delphi: un pronóstico colectivo sin la ilusión del consenso',
			paragraphs: [
				'Wideband Delphi es un método para obtener un pronóstico grupal o una estimación experta en el que los participantes responden de forma anónima, ven la dispersión de las demás opiniones y ajustan su posición a lo largo de varias rondas. Nadie presiona con autoridad ni se acomoda a quien habló primero: la estimación final surge de un acercamiento deliberado, o de un registro honesto del desacuerdo.',
				'El nombre proviene de la ingeniería de software: el método se usó originalmente para estimar plazos de desarrollo, donde "wideband" significa un rango de estimación amplio (mínimo-esperado-máximo), y "Delphi" hace referencia al oráculo de la antigua Grecia. Hoy se aplica en cualquier lugar donde se necesite un pronóstico bajo incertidumbre: economía, mercado laboral, precios, tecnología, tendencias sociales.'
			],
			comparisonTitle: 'Por qué es mejor que una encuesta o una votación habitual',
			comparisonColumns: ['Encuesta habitual', 'Discusión abierta', 'Wideband Delphi'],
			comparisonCriteria: [
				'Anonimato',
				'Considera la incertidumbre',
				'Protección frente al efecto ancla',
				'Revisar la posición con argumentos',
				'Visibilidad del desacuerdo'
			],
			comparisonRows: [
				['Normalmente no', 'No', 'Sí'],
				['No', 'A veces', 'Sí (rango min-max)'],
				['No', 'No', 'Sí'],
				['No', 'Parcialmente', 'Sí, de forma estructurada'],
				['Oculta en el promedio', 'Visible, pero caótica', 'Visible y estructurada']
			]
		},
		intro: {
			eyebrow: 'Decision intelligence',
			title: 'No es una encuesta. Es un artefacto de decisión.',
			body: 'Cuando faltan datos históricos, los equipos defienden sus planes y los pronósticos externos divergen, una sola opinión experta no basta. WeOracle captura estimaciones independientes, destaca supuestos en conflicto y guía al grupo hacia una decisión transparente.'
		},
		casesHeading: { eyebrow: 'TOP-5 casos de uso', title: 'Dónde el método muestra más valor' },
		cases: [
			{
				kicker: '01 / Capital projects',
				title: 'CAPEX y plazos de grandes proyectos',
				body: 'Reúna consenso independiente de ingeniería, compras, control de proyectos y finanzas antes del comité de inversión.',
				result: 'Rango de CAPEX, rango de plazos, dependencias críticas y causas de desviación.',
				image: '/gen/case-capex-project-estimation.png',
				alt: 'Panel de planificación de un gran proyecto con modelo de instalación y cronograma'
			},
			{
				kicker: '02 / Technology roadmap',
				title: 'Pronóstico de creación y madurez tecnológica',
				body: 'Estime qué tecnologías madurarán, cuándo serán aplicables y qué barreras deben eliminarse.',
				result: 'Mapa de madurez, probabilidad de éxito técnico, plazo y coste para avanzar.',
				image: '/gen/case-technology-maturity-tree.png',
				alt: 'Árbol de objetivos tecnológicos con indicadores de madurez y viabilidad'
			},
			{
				kicker: '03 / Resource allocation',
				title: 'Asignación de presupuesto entre iniciativas',
				body: 'Convierta solicitudes competidoras en un portafolio priorizado mediante juicio experto anónimo.',
				result: 'Distribución recomendada, priority score y escenarios para distintos límites.',
				image: '/gen/case-budget-portfolio-allocation.png',
				alt: 'Interfaz de asignación de presupuesto entre iniciativas estratégicas'
			},
			{
				kicker: '04 / Long-term contracts',
				title: 'Corredores de precio para contratos largos',
				body: 'Use un rango operativo para compras, LTA y negociación en lugar de depender de un único pronóstico.',
				result:
					'Corredor de precio, límites de escenarios y condiciones de revisión contractual.',
				image: '/gen/case-price-corridor-contracts.png',
				alt: 'Pantalla analítica con corredor de precios y curvas de escenarios'
			},
			{
				kicker: '05 / Turnaround',
				title: 'Cronogramas de mantenimiento y paradas',
				body: 'Alinee una ventana realista entre producción, contratistas, compras y finanzas.',
				result: 'Ruta crítica, riesgos de comprimir plazos y coste de cada compromiso.',
				image: '/gen/case-turnaround-schedule.png',
				alt: 'Panel industrial de planificación de mantenimiento con línea temporal'
			}
		],
		workflow: {
			eyebrow: 'Cómo funciona',
			title: 'Cinco pasos desde estimaciones dispersas hasta un rango de decisión',
			steps: [
				'El facilitador define la pregunta, escalas, participantes y criterios de consenso.',
				'Los expertos envían estimaciones de tres puntos, argumentos y supuestos.',
				'WeOracle agrega respuestas y muestra dispersión y zonas de desacuerdo.',
				'Tras discutir los puntos disputados, una nueva ronda afina las estimaciones.',
				'El equipo recibe rangos, prioridades, riesgos y un brief listo para comité.'
			]
		},
		result: {
			eyebrow: 'Resultado final',
			title: 'El resultado no es un chat ni una hoja de cálculo. Es un brief de decisión.',
			body: 'El resultado final sirve para un comité de inversión, sesión presupuestaria, consejo tecnológico o revisión operativa: rangos, argumentos, supuestos discutidos, riesgos y acciones recomendadas en un solo documento.',
			cta: 'Abrir WeOracle'
		},
		labels: {
			nav: 'Navegación principal',
			metrics: 'Propiedades clave del método',
			definition: 'Qué es Wideband Delphi',
			cases: 'Casos de WeOracle',
			workflow: 'Proceso Wideband Delphi',
			result: 'Resultado de la sesión'
		}
	}
};
