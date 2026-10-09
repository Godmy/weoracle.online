import type { RecipeLandingPage } from '$stylist/wbd/interface/recipe/landing-page';

export const ObjectLandingEs: RecipeLandingPage = {
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
			result: 'Corredor de precio, límites de escenarios y condiciones de revisión contractual.',
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
		emptyText:
			'Las encuestas públicas aparecerán aquí cuando se publique la primera sesión abierta.'
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
					{
						label: 'Mejor que',
						value: 'una votación simple sin argumentos ni revisión de posición'
					},
					{
						label: 'Resultado',
						value: 'un pronóstico público con desacuerdo explicado e incertidumbre estructurada'
					}
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
					{
						label: 'Resultado',
						value: 'infraestructura de decisión con metodología experta repetible'
					}
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
		thanksBodyWithType:
			'Gracias — hemos recibido tu solicitud de "{type}". Te contactaremos por email en breve.',
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
};
