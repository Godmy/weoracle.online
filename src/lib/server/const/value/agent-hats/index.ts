export const AGENT_HATS = ['white', 'red', 'black', 'yellow', 'green', 'blue'] as const;
export type AgentHat = (typeof AGENT_HATS)[number];

export interface AgentHatMeta {
	label: string;
	alias: string;
	email: string;
	/** What this hat is supposed to research/optimize for — see docs/chat/20260817/002-CLAUDE-METHODOLOGY.md. */
	focus: string;
	/** Base position (0..1) along a question's [min_value, max_value] range for the mock estimate. */
	position: number;
	/** Fraction of the range used to spread optimistic/pessimistic away from realistic. */
	spread: number;
	confidenceBase: number;
}

/**
 * White/Red/Black/Yellow/Green submit numeric estimates; Blue only synthesizes (see
 * `ManagerAgentPanel`). `position`/`spread`/`confidenceBase` currently drive the mock estimate —
 * once a real LLM is wired in, they stop being used for math and become prompt-tuning knobs instead.
 */
export const AGENT_HAT_META: Record<AgentHat, AgentHatMeta> = {
	white: {
		label: 'White Hat',
		alias: 'AI · White Hat',
		email: 'ai-white-hat@bots.weoracle.online',
		focus: 'нейтральные факты и статистика',
		position: 0.5,
		spread: 0.12,
		confidenceBase: 4
	},
	red: {
		label: 'Red Hat',
		alias: 'AI · Red Hat',
		email: 'ai-red-hat@bots.weoracle.online',
		focus: 'рыночное настроение и интуиция',
		position: 0.58,
		spread: 0.22,
		confidenceBase: 2
	},
	black: {
		label: 'Black Hat',
		alias: 'AI · Black Hat',
		email: 'ai-black-hat@bots.weoracle.online',
		focus: 'риски и факторы срыва прогноза',
		position: 0.27,
		spread: 0.18,
		confidenceBase: 3
	},
	yellow: {
		label: 'Yellow Hat',
		alias: 'AI · Yellow Hat',
		email: 'ai-yellow-hat@bots.weoracle.online',
		focus: 'позитивные катализаторы',
		position: 0.76,
		spread: 0.18,
		confidenceBase: 3
	},
	green: {
		label: 'Green Hat',
		alias: 'AI · Green Hat',
		email: 'ai-green-hat@bots.weoracle.online',
		focus: 'нестандартные альтернативные сценарии',
		position: 0.15,
		spread: 0.3,
		confidenceBase: 2
	},
	blue: {
		label: 'Blue Hat',
		alias: 'AI · Blue Hat',
		email: 'ai-blue-hat@bots.weoracle.online',
		focus: 'модерация и синтез раунда',
		position: 0.5,
		spread: 0,
		confidenceBase: 3
	}
};

export const CONTENT_AGENT_HATS = AGENT_HATS.filter(
	(hat): hat is Exclude<AgentHat, 'blue'> => hat !== 'blue'
);
