import type { RecipeLandingPage } from '$stylist/wbd/interface/recipe/landing-page';

export const ObjectLandingEn: RecipeLandingPage = {
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
			result: 'Recommended budget allocation, priority scores, and scenarios for different limits.',
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
					{
						label: 'Output',
						value: 'a public forecast with explained disagreement and uncertainty structure'
					}
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
		thanksBodyWithType:
			'Thanks — we received your "{type}" request. We will contact you by email shortly.',
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
};
