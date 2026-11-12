/**
 * Shell strings that have no `wbd_translations` row yet; menu items with existing keys
 * (`nav.*`, `app.signOut`) still go through `t()`.
 */
export interface ShellLabel {
	experts: string;
	setup: string;
	results: string;
	administration: string;
	users: string;
	auditLog: string;
	session: string;
	newSession: string;
	round: string;
	sessionAnalytics: string;
	account: string;
	language: string;
	theme: string;
	signIn: string;
	allFilter: string;
	publicFilter: string;
	privateFilter: string;
	statusFilter: string;
	visibilityFilter: string;
	roles: Record<string, string>;
	statuses: Record<string, string>;
}

export const RecordShellLabel: Record<string, ShellLabel> = {
	en: {
		experts: 'Experts',
		setup: 'Setup',
		results: 'Results',
		administration: 'Administration',
		users: 'Users',
		auditLog: 'Audit log',
		session: 'Session',
		newSession: 'New session',
		round: 'Round',
		sessionAnalytics: 'Session analytics',
		account: 'Account',
		language: 'Language',
		theme: 'Theme',
		signIn: 'Sign in',
		allFilter: 'All',
		publicFilter: 'Public',
		privateFilter: 'Private',
		statusFilter: 'Status',
		visibilityFilter: 'Visibility',
		roles: { admin: 'Administrator', coordinator: 'Coordinator', expert: 'Expert' },
		statuses: {
			draft: 'Draft',
			active: 'Active',
			round_1: 'Round 1',
			round_2: 'Round 2',
			round_3: 'Round 3',
			completed: 'Completed'
		}
	},
	ru: {
		experts: 'Эксперты',
		setup: 'Подготовка',
		results: 'Результаты',
		administration: 'Администрирование',
		users: 'Пользователи',
		auditLog: 'Журнал аудита',
		session: 'Сессия',
		newSession: 'Новая сессия',
		round: 'Раунд',
		sessionAnalytics: 'Аналитика сессии',
		account: 'Аккаунт',
		language: 'Язык',
		theme: 'Тема',
		signIn: 'Войти',
		allFilter: 'Все',
		publicFilter: 'Публичные',
		privateFilter: 'Приватные',
		statusFilter: 'Статус',
		visibilityFilter: 'Видимость',
		roles: { admin: 'Администратор', coordinator: 'Координатор', expert: 'Эксперт' },
		statuses: {
			draft: 'Черновик',
			active: 'Активна',
			round_1: 'Раунд 1',
			round_2: 'Раунд 2',
			round_3: 'Раунд 3',
			completed: 'Завершена'
		}
	},
	es: {
		experts: 'Expertos',
		setup: 'Preparación',
		results: 'Resultados',
		administration: 'Administración',
		users: 'Usuarios',
		auditLog: 'Registro de auditoría',
		session: 'Sesión',
		newSession: 'Nueva sesión',
		round: 'Ronda',
		sessionAnalytics: 'Analítica de la sesión',
		account: 'Cuenta',
		language: 'Idioma',
		theme: 'Tema',
		signIn: 'Iniciar sesión',
		allFilter: 'Todas',
		publicFilter: 'Públicas',
		privateFilter: 'Privadas',
		statusFilter: 'Estado',
		visibilityFilter: 'Visibilidad',
		roles: { admin: 'Administrador', coordinator: 'Coordinador', expert: 'Experto' },
		statuses: {
			draft: 'Borrador',
			active: 'Activa',
			round_1: 'Ronda 1',
			round_2: 'Ronda 2',
			round_3: 'Ronda 3',
			completed: 'Completada'
		}
	}
};
