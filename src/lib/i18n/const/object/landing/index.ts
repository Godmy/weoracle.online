import type { RecipeLandingPage } from '$stylist/wbd/interface/recipe/landing-page';

export const ObjectLanding: Record<string, RecipeLandingPage> = {
	ru: {
		metaTitle: 'WeOracle — Wideband Delphi для управленческих решений',
		metaDescription:
			'WeOracle помогает собрать анонимный экспертный консенсус по CAPEX, технологиям, бюджету, контрактным ценам и промышленным графикам.',
		nav: {
			about: 'Wideband Delphi',
			method: 'О методе',
			cases: 'Кейсы',
			polls: 'Опросы',
			pilot: 'Пилот',
			signIn: 'Войти'
		},
		hero: {
			eyebrow: 'Платформа Wideband Delphi',
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
				'Механизм анонимной оценки простой: фасилитатор задаёт вопрос, шкалу и критерии консенсуса; эксперты независимо отправляют оценки и аргументы без раскрытия имён; система показывает распределение ответов, диапазоны и обезличенные объяснения; после этого участники уточняют позицию в следующем раунде. Видны аргументы и расхождения, но не социальный вес автора.',
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
			eyebrow: 'Интеллектуальная поддержка решений',
			title: 'Не опрос ради опроса, а управленческий артефакт',
			body: '1951 год, RAND Corporation. США пытаются оценить угрозу, для которой нет разведданных: сколько ударов нужно противнику, чтобы вывести из строя экономику страны. Ответа не существует — есть только независимые оценки экспертов, которые расходятся. Так родился метод Delphi: не голосование, а структурированное сведение экспертных мнений к рабочему диапазону.',
			paragraphs: [
				'1951 год, RAND Corporation. США пытаются оценить угрозу, для которой нет разведданных: сколько ударов нужно противнику, чтобы вывести из строя экономику страны. Ответа не существует — есть только независимые оценки экспертов, которые расходятся. Так родился метод Delphi: не голосование, а структурированное сведение экспертных мнений к рабочему диапазону. В 1970-х Барри Боэм адаптировал его для инженерных решений и назвал Wideband Delphi — с этого момента метод стал стандартом там, где нужно принять решение без точных данных, но с высокой ценой ошибки.',
				'Сегодня та же логика работает не для военных прогнозов, а для инвесткомитетов и проектных офисов. Когда исторических данных мало, участники защищают свои планы, а внешние прогнозы расходятся, одна экспертная позиция не закрывает риск. WeOracle фиксирует независимые оценки, подсвечивает конфликт допущений и доводит группу до прозрачного решения.'
			],
			metrics: [
				['1951', 'год рождения метода, RAND Corporation'],
				['70+ лет', 'метод проверен на решениях с ценой ошибки в миллиарды'],
				['От военных прогнозов', 'до инвесткомитетов и капитальных проектов']
			]
		},
		casesHeading: { eyebrow: 'ТОП-5 сценариев применения', title: 'Где метод дает самый понятный эффект' },
		cases: [
			{
				kicker: '01 / Капитальные проекты',
				title: 'Оценка CAPEX и сроков крупных проектов',
				body: 'Соберите независимый консенсус инженеров, снабжения, проектного офиса и финансов до решения инвесткомитета.',
				result: 'Диапазон CAPEX, сроков, критических зависимостей и факторов отклонения.',
				image: '/gen/case-capex-project-estimation.png',
				alt: 'Панель планирования крупного промышленного проекта с моделью объекта и графиками сроков'
			},
			{
				kicker: '02 / Технологическая стратегия',
				title: 'Прогноз создания и зрелости технологий',
				body: 'Оцените, какие технологии действительно созреют, когда станут применимыми и какие барьеры нужно снять.',
				result: 'Карта зрелости, вероятность технического успеха, сроки и стоимость доведения.',
				image: '/gen/case-technology-maturity-tree.png',
				alt: 'Иерархическая карта технологических целей с экспертными оценками зрелости'
			},
			{
				kicker: '03 / Распределение ресурсов',
				title: 'Распределение бюджета между инициативами',
				body: 'Превратите конкурирующие заявки подразделений в приоритетный портфель на основе анонимной экспертной оценки.',
				result:
					'Рекомендуемое распределение бюджета, priority score и сценарии при разных лимитах.',
				image: '/gen/case-budget-portfolio-allocation.png',
				alt: 'Интерфейс портфельного распределения бюджета между стратегическими инициативами'
			},
			{
				kicker: '04 / Долгосрочные контракты',
				title: 'Прогноз ценовых коридоров для контрактов',
				body: 'Получите рабочий диапазон цены для LTA, закупок и переговоров, не полагаясь на один прогноз.',
				result: 'Ценовой коридор, сценарные границы и условия пересмотра контрактной формулы.',
				image: '/gen/case-price-corridor-contracts.png',
				alt: 'Аналитический экран с коридором цен и сценарными линиями для долгосрочного контракта'
			},
			{
				kicker: '05 / Ремонты и остановы',
				title: 'График капитальных ремонтов и остановов',
				body: 'Согласуйте реалистичное окно ремонта между производством, подрядчиками, снабжением и финансами.',
				result: 'Критический путь, риски сокращения сроков и цена каждого компромисса.',
				image: '/gen/case-turnaround-schedule.png',
				alt: 'Промышленная панель планирования капитального ремонта с временной шкалой и зависимостями'
			}
		],
		publicPollsSection: {
			eyebrow: 'Публичные опросы',
			title: 'Открытые экспертные вопросы, в которых можно участвовать',
			body: 'Это публичные Wideband Delphi сессии из базы WeOracle: у каждой есть собственный контекст, изображение, набор вопросов и статус прохождения раундов.',
			notifyButtonLabel: 'Участвовать!',
			emptyText: 'Публичные опросы появятся здесь после публикации первой открытой сессии.'
		},
		applicationCta: {
			eyebrow: 'Пилот и внедрение',
			title: 'Запустите WeOracle под свою задачу',
			body: 'Выберите вариант запуска WeOracle. WeOracle можно запустить как публичный брендированный опрос, закрытую экспертную сессию или корпоративный процесс принятия решений. Мы помогаем настроить брендирование, сконструировать вопросы, подготовить вводные материалы и добавить к каждому вопросу одно видео до 1 минуты или изображения.',
			options: [
				{
					id: 'public-poll',
					text: 'Публичный опрос',
					body: 'Открытая экспертная сессия, которую может проводить бренд, исследовательский проект или публичная команда, чтобы собрать данные и аргументы по заметной теме: рынок труда, цены, технологии, отраслевые тренды, региональные сценарии.',
					features: [
						'Публичная брендированная карточка с изображением, описанием, статусом и входом для участников.',
						'Брендирование страницы опроса, приглашений и итоговых материалов.',
						'К каждому вопросу можно добавить одно видео до 1 минуты или изображения с контекстом.',
						'Сбор заявок экспертов и прохождение тех же раундов Wideband Delphi.',
						'Подходит для публичной аналитики, PR-исследований, медиа-проектов, отраслевых прогнозов и сбора рыночных данных.'
					],
					comparison: [
						{ label: 'Лучше чем', value: 'простое голосование без аргументов и пересмотра позиции' },
						{ label: 'Результат', value: 'публичный прогноз с объяснением расхождений и структуры неопределённости' }
					],
					buttonText: 'Запросить опрос'
				},
				{
					id: 'private-session',
					text: 'Закрытая сессия',
					body: 'Разовый запуск для конкретного управленческого решения компании, бренда или отдельного пользователя: инвестиции, бюджет, сроки, закупка, технологический выбор или спорный прогноз. Может быть оформлена в вашем брендинге.',
					features: [
						'Закрытый доступ для приглашённых экспертов, анонимные ответы и контроль фасилитатора.',
						'Брендирование интерфейса, приглашений и итогового документа под компанию или проект.',
						'Консалтинг по постановке задачи, шкалам оценки, составу экспертов и логике раундов.',
						'К каждому вопросу можно приложить одно короткое видео или изображения с исходными данными.',
						'Трёхточечные оценки, аргументы, допущения, несколько раундов уточнения и финальный отчёт.'
					],
					comparison: [
						{ label: 'Лучше чем', value: 'совещание, где сильная позиция давит на остальных участников' },
						{ label: 'Результат', value: 'согласованный диапазон решения вместо одной спорной цифры' }
					],
					buttonText: 'Запросить сессию'
				},
				{
					id: 'enterprise-setup',
					text: 'Корпоративное внедрение',
					body: 'Настройка WeOracle как повторяемого корпоративного процесса: развёртывание, шаблоны решений, роли, экспертные панели, правила публикации результатов, отчёты, администрирование и обучение команды.',
					features: [
						'Развёртывание в Docker, конфигурация окружения и инструкции по эксплуатации для технической команды.',
						'Шаблоны сессий, роли администраторов, экспертные пулы, брендирование и регулярные отчёты.',
						'Помощь в конструировании корпоративных опросов, критериев консенсуса и документов с результатами.',
						'Итоговые материалы можно готовить в электронном виде и в формате для печати на бумажном носителе.',
						'Единые правила для CAPEX, бюджетов, технологических советов и операционных решений.',
						'Инструкции для персонала, обучение работе с системой и поддержка запуска первых сессий.'
					],
					comparison: [
						{ label: 'Лучше чем', value: 'разовые несвязанные опросы в таблицах и чатах' },
						{ label: 'Результат', value: 'инфраструктура экспертных решений с повторяемой методологией' }
					],
					buttonText: 'Обсудить внедрение'
				}
			],
			formTitle: 'Анкета заявки',
			nameLabel: 'Имя',
			emailLabel: 'Email',
			companyLabel: 'Компания',
			messageLabel: 'Какое решение или прогноз нужно поддержать?',
			submitLabel: 'Отправить заявку',
			thanksTitle: 'Заявка отправлена',
			thanksBody: 'Спасибо — мы получили вашу заявку. Мы свяжемся с вами по email.',
			thanksBodyWithType: 'Спасибо — мы получили вашу заявку «{type}». Мы свяжемся с вами по email.',
			thanksLink: 'Отправить ещё одну заявку'
		},
		workflow: {
			eyebrow: 'Как работает Wideband Delphi',
			title: 'Пять шагов от разрозненных мнений к диапазону решения',
			steps: [
				'Фасилитатор задает вопрос, шкалы оценки, участников и критерии консенсуса.',
				'Эксперты независимо дают трехточечные оценки, аргументы и допущения.',
				'WeOracle агрегирует ответы, показывает разброс и зоны расхождения.',
				'После обсуждения спорных зон проходит следующий раунд уточнения.',
				'Команда получает диапазон, приоритеты, риски и документ для рассмотрения на комитете.'
			]
		},
		result: {
			eyebrow: 'Итоговый результат',
			title: 'На выходе не чат и не таблица, а документ для принятия решения',
			body: 'Финальный результат можно обсуждать на инвесткомитете, бюджетной сессии, технологическом совете или операционном штабе: диапазоны, аргументы, спорные допущения, риски и рекомендуемые действия собраны в один документ. Для пилотных и брендированных запусков мы помогаем сконструировать опрос, подготовить материалы, оформить результаты под бренд и собрать итоговые документы в электронном виде и в формате для печати.'
		},
		labels: {
			nav: 'Основная навигация',
			metrics: 'Ключевые свойства метода',
			definition: 'Что такое Wideband Delphi',
			cases: 'Кейсы WeOracle',
			publicPolls: 'Публичные опросы WeOracle',
			applicationCta: 'Заявка на запуск WeOracle',
			workflow: 'Процесс Wideband Delphi',
			result: 'Результат сессии'
		}
	},
	en: {
		metaTitle: 'WeOracle — Wideband Delphi for executive decisions',
		metaDescription:
			'WeOracle gathers anonymous expert consensus for CAPEX, technology roadmaps, budgets, contract prices, and industrial schedules.',
		nav: {
			about: 'Wideband Delphi',
			method: 'About',
			cases: 'Cases',
			polls: 'Polls',
			pilot: 'Pilot',
			signIn: 'Sign in'
		},
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
				'The anonymous estimation mechanism is straightforward: the facilitator defines the question, scale, and consensus criteria; experts submit estimates and rationale independently without names attached; the system shows response distributions, ranges, and anonymized explanations; participants then refine their position in the next round. Arguments and disagreement stay visible, but social pressure is removed.',
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
		publicPollsSection: {
			eyebrow: 'Public polls',
			title: 'Open expert questions you can join',
			body: 'These are public Wideband Delphi sessions from the WeOracle database: each poll keeps its own context, image, question set, and round status.',
			notifyButtonLabel: 'Join!',
			emptyText: 'Public polls will appear here after the first public session is published.'
		},
		applicationCta: {
			eyebrow: 'Pilot and implementation',
			title: 'Launch WeOracle for your decision. Choose a WeOracle launch option.',
			body: 'WeOracle can run as a branded public poll, a closed expert session, or a repeatable enterprise decision process. We help configure branding, design the questions, prepare source materials, and attach one video up to 1 minute or images to each question.',
			options: [
				{
					id: 'public-poll',
					text: 'Public poll',
					body: 'An open expert session that a brand, research project, or public team can run to collect data and arguments around a visible topic: labor markets, prices, technologies, industry trends, and regional scenarios.',
					features: [
						'Public branded card with image, description, status, and participation entry point.',
						'Branding for the poll page, invitations, and final materials.',
						'Each question can include one short video or contextual images.',
						'Expert intake with the same structured Wideband Delphi rounds.',
						'Useful for public analytics, PR research, media projects, industry forecasts, and market data collection.'
					],
					comparison: [
						{ label: 'Better than', value: 'a simple vote without arguments or position revision' },
						{ label: 'Output', value: 'a public forecast with explained disagreement and uncertainty structure' }
					],
					buttonText: 'Request poll'
				},
				{
					id: 'private-session',
					text: 'Private session',
					body: 'A one-off launch for a concrete decision by a company, brand, or individual user: investment, budget, timeline, procurement, technology choice, or disputed forecast. It can be delivered with your own branding.',
					features: [
						'Private expert access with anonymous answers and facilitator control.',
						'Branded interface, invitations, and final decision brief for the company or project.',
						'Consulting on question design, scales, expert composition, and round logic.',
						'Each question can include one short video or source images.',
						'Three-point estimates, rationale, assumptions, convergence rounds, and final report.'
					],
					comparison: [
						{ label: 'Better than', value: 'a meeting where one strong opinion anchors the room' },
						{ label: 'Output', value: 'a defended decision range instead of one fragile number' }
					],
					buttonText: 'Request session'
				},
				{
					id: 'enterprise-setup',
					text: 'Enterprise setup',
					body: 'Set up WeOracle as a repeatable company process: deployment, decision templates, roles, expert panels, publication rules, reports, administration, and team training.',
					features: [
						'Docker deployment, environment configuration, and operations instructions for the technical team.',
						'Reusable session templates, administrator roles, expert pools, branding, and regular reports.',
						'Support for designing corporate polls, consensus criteria, and result documents.',
						'Final materials can be prepared as digital documents and print-ready files.',
						'Shared rules for CAPEX, budgets, technology councils, and operational decisions.',
						'Staff instructions, system training, and support for launching the first sessions.'
					],
					comparison: [
						{ label: 'Better than', value: 'disconnected one-off polls in spreadsheets and chats' },
						{ label: 'Output', value: 'decision infrastructure with a repeatable expert methodology' }
					],
					buttonText: 'Discuss setup'
				}
			],
			formTitle: 'Application form',
			nameLabel: 'Name',
			emailLabel: 'Email',
			companyLabel: 'Company',
			messageLabel: 'What decision or forecast do you need to support?',
			submitLabel: 'Send application',
			thanksTitle: 'Application sent',
			thanksBody: 'Thanks — we received your request. We will contact you by email shortly.',
			thanksBodyWithType: 'Thanks — we received your "{type}" request. We will contact you by email shortly.',
			thanksLink: 'Send another request'
		},
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
			body: 'The final result is usable in an investment committee, budget session, technology council, or operations review: ranges, rationale, contested assumptions, risks, and recommended actions in one document.'
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
		nav: {
			about: 'Wideband Delphi',
			method: 'Sobre el método',
			cases: 'Casos',
			polls: 'Encuestas',
			pilot: 'Piloto',
			signIn: 'Entrar'
		},
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
				'El mecanismo de estimación anónima es directo: el facilitador define la pregunta, escala y criterios de consenso; los expertos envían estimaciones y argumentos de forma independiente sin mostrar nombres; el sistema muestra distribuciones, rangos y explicaciones anonimizadas; después los participantes ajustan su posición en la siguiente ronda. Los argumentos y desacuerdos son visibles, pero se elimina la presión social.',
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
			eyebrow: 'Inteligencia de decisión',
			title: 'No es una encuesta. Es un artefacto de decisión.',
			body: 'Cuando faltan datos históricos, los equipos defienden sus planes y los pronósticos externos divergen, una sola opinión experta no basta. WeOracle captura estimaciones independientes, destaca supuestos en conflicto y guía al grupo hacia una decisión transparente.'
		},
		casesHeading: { eyebrow: 'TOP-5 casos de uso', title: 'Dónde el método muestra más valor' },
		cases: [
			{
				kicker: '01 / Proyectos de capital',
				title: 'CAPEX y plazos de grandes proyectos',
				body: 'Reúna consenso independiente de ingeniería, compras, control de proyectos y finanzas antes del comité de inversión.',
				result: 'Rango de CAPEX, rango de plazos, dependencias críticas y causas de desviación.',
				image: '/gen/case-capex-project-estimation.png',
				alt: 'Panel de planificación de un gran proyecto con modelo de instalación y cronograma'
			},
			{
				kicker: '02 / Hoja de ruta tecnológica',
				title: 'Pronóstico de creación y madurez tecnológica',
				body: 'Estime qué tecnologías madurarán, cuándo serán aplicables y qué barreras deben eliminarse.',
				result: 'Mapa de madurez, probabilidad de éxito técnico, plazo y coste para avanzar.',
				image: '/gen/case-technology-maturity-tree.png',
				alt: 'Árbol de objetivos tecnológicos con indicadores de madurez y viabilidad'
			},
			{
				kicker: '03 / Asignación de recursos',
				title: 'Asignación de presupuesto entre iniciativas',
				body: 'Convierta solicitudes competidoras en un portafolio priorizado mediante juicio experto anónimo.',
				result: 'Distribución recomendada, priority score y escenarios para distintos límites.',
				image: '/gen/case-budget-portfolio-allocation.png',
				alt: 'Interfaz de asignación de presupuesto entre iniciativas estratégicas'
			},
			{
				kicker: '04 / Contratos a largo plazo',
				title: 'Corredores de precio para contratos largos',
				body: 'Use un rango operativo para compras, LTA y negociación en lugar de depender de un único pronóstico.',
				result:
					'Corredor de precio, límites de escenarios y condiciones de revisión contractual.',
				image: '/gen/case-price-corridor-contracts.png',
				alt: 'Pantalla analítica con corredor de precios y curvas de escenarios'
			},
			{
				kicker: '05 / Paradas y mantenimiento',
				title: 'Cronogramas de mantenimiento y paradas',
				body: 'Alinee una ventana realista entre producción, contratistas, compras y finanzas.',
				result: 'Ruta crítica, riesgos de comprimir plazos y coste de cada compromiso.',
				image: '/gen/case-turnaround-schedule.png',
				alt: 'Panel industrial de planificación de mantenimiento con línea temporal'
			}
		],
		publicPollsSection: {
			eyebrow: 'Encuestas públicas',
			title: 'Preguntas expertas abiertas en las que puedes participar',
			body: 'Son sesiones públicas de Wideband Delphi desde la base de WeOracle: cada encuesta tiene su propio contexto, imagen, conjunto de preguntas y estado de rondas.',
			notifyButtonLabel: 'Participar!',
			emptyText: 'Las encuestas públicas aparecerán aquí cuando se publique la primera sesión abierta.'
		},
		applicationCta: {
			eyebrow: 'Piloto e implementación',
			title: 'Lanza WeOracle para tu decisión. Elige una opción de lanzamiento.',
			body: 'WeOracle puede ejecutarse como encuesta pública con marca, sesión experta cerrada o proceso empresarial repetible. Ayudamos a configurar la marca, diseñar las preguntas, preparar materiales de contexto y adjuntar a cada pregunta un video de hasta 1 minuto o imágenes.',
			options: [
				{
					id: 'public-poll',
					text: 'Encuesta pública',
					body: 'Una sesión experta abierta que puede realizar una marca, un proyecto de investigación o un equipo público para recopilar datos y argumentos sobre un tema visible: mercado laboral, precios, tecnologías, tendencias sectoriales y escenarios regionales.',
					features: [
						'Tarjeta pública con marca, imagen, descripción, estado y entrada de participación.',
						'Marca para la página de encuesta, invitaciones y materiales finales.',
						'Cada pregunta puede incluir un video corto o imágenes de contexto.',
						'Entrada de expertos con las mismas rondas estructuradas de Wideband Delphi.',
						'Útil para analítica pública, investigación de marca, medios, pronósticos sectoriales y datos de mercado.'
					],
					comparison: [
						{ label: 'Mejor que', value: 'una votación simple sin argumentos ni revisión de posición' },
						{ label: 'Resultado', value: 'un pronóstico público con desacuerdo explicado e incertidumbre estructurada' }
					],
					buttonText: 'Solicitar encuesta'
				},
				{
					id: 'private-session',
					text: 'Sesión privada',
					body: 'Un lanzamiento único para una decisión concreta de una empresa, marca o usuario individual: inversión, presupuesto, plazos, compras, elección tecnológica o pronóstico discutido. Puede entregarse con tu propia marca.',
					features: [
						'Acceso privado para expertos, respuestas anónimas y control del facilitador.',
						'Interfaz, invitaciones y brief final con la marca de la empresa o proyecto.',
						'Consultoría sobre diseño de preguntas, escalas, composición experta y lógica de rondas.',
						'Cada pregunta puede incluir un video corto o imágenes con datos de partida.',
						'Estimaciones de tres puntos, argumentos, supuestos, rondas de convergencia e informe final.'
					],
					comparison: [
						{ label: 'Mejor que', value: 'una reunión donde una opinión fuerte condiciona al grupo' },
						{ label: 'Resultado', value: 'un rango defendible en lugar de una cifra frágil' }
					],
					buttonText: 'Solicitar sesión'
				},
				{
					id: 'enterprise-setup',
					text: 'Implementación empresarial',
					body: 'Configura WeOracle como proceso empresarial repetible: despliegue, plantillas de decisión, roles, paneles expertos, reglas de publicación, informes, administración y formación del equipo.',
					features: [
						'Despliegue en Docker, configuración de entorno e instrucciones operativas para el equipo técnico.',
						'Plantillas reutilizables, roles de administración, paneles expertos, marca e informes periódicos.',
						'Apoyo para diseñar encuestas corporativas, criterios de consenso y documentos de resultados.',
						'Los materiales finales pueden prepararse como documentos digitales y archivos listos para imprimir.',
						'Reglas comunes para CAPEX, presupuestos, consejos tecnológicos y decisiones operativas.',
						'Instrucciones para el personal, formación en el sistema y soporte para lanzar las primeras sesiones.'
					],
					comparison: [
						{ label: 'Mejor que', value: 'encuestas aisladas en hojas de cálculo y chats' },
						{ label: 'Resultado', value: 'infraestructura de decisión con metodología experta repetible' }
					],
					buttonText: 'Discutir implementación'
				}
			],
			formTitle: 'Formulario de solicitud',
			nameLabel: 'Nombre',
			emailLabel: 'Email',
			companyLabel: 'Empresa',
			messageLabel: 'Qué decisión o pronóstico necesitas apoyar?',
			submitLabel: 'Enviar solicitud',
			thanksTitle: 'Solicitud enviada',
			thanksBody: 'Gracias — hemos recibido tu solicitud. Te contactaremos por email en breve.',
			thanksBodyWithType: 'Gracias — hemos recibido tu solicitud de "{type}". Te contactaremos por email en breve.',
			thanksLink: 'Enviar otra solicitud'
		},
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
			body: 'El resultado final sirve para un comité de inversión, sesión presupuestaria, consejo tecnológico o revisión operativa: rangos, argumentos, supuestos discutidos, riesgos y acciones recomendadas en un solo documento.'
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
