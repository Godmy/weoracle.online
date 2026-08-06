<script lang="ts">
	import { page } from '$app/state';
	import { AdminSidebar, ThemeModeToggle } from 'stylist-svelte';
	import type { StructWbdAdminNavItem } from 'stylist-svelte';
	import LanguageControl from '$lib/wbd/language-control.svelte';
	import BrandLogo from '$lib/brand-logo.svelte';
	import { t } from '$lib/i18n';

	let { data, children } = $props();

	const path = $derived(page.url.pathname);

	const STATIC_SECTIONS = $derived<Array<{ id: string; label: string; href: string; iconName: string }>>([
		{ id: 'sessions', label: t('nav.sessions'), href: '/app', iconName: 'list' },
		{ id: 'questions', label: t('nav.questions'), href: '/app/questions', iconName: 'file' },
		{ id: 'estimates', label: t('nav.estimates'), href: '/app/estimates', iconName: 'check-circle' },
		{ id: 'analytics', label: t('nav.analytics'), href: '/app/analytics', iconName: 'activity' },
		{ id: 'discussions', label: t('nav.discussions'), href: '/app/discussions', iconName: 'chat' },
		{ id: 'reports', label: t('nav.reports'), href: '/app/reports', iconName: 'folder' }
	]);

	function isActive(item: { id: string; href: string }): boolean {
		if (item.id === 'sessions') {
			return !STATIC_SECTIONS.some((s) => s.id !== 'sessions' && (path === s.href || path.startsWith(`${s.href}/`))) &&
				path !== '/app/admin' &&
				!path.startsWith('/app/admin/');
		}
		return path === item.href || path.startsWith(`${item.href}/`);
	}

	const navItems = $derived<StructWbdAdminNavItem[]>([
		...STATIC_SECTIONS.map((item) => ({ ...item, active: isActive(item) })),
		...(data.user?.role === 'admin'
			? [
					{
						id: 'settings',
						label: t('nav.settings'),
						href: '/app/admin',
						iconName: 'settings',
						active: path === '/app/admin' || path.startsWith('/app/admin/')
					}
				]
			: [])
	]);

	const activeNavItem = $derived(navItems.find((item) => item.active) ?? navItems[0]);
	const detailSession = $derived(page.data.session as { title?: string } | undefined);
	const isSessionDetailPage = $derived(Boolean(detailSession && /^\/app\/[^/]+$/.test(path)));
	const headerTitle = $derived.by(() => {
		if (path === '/app/new') return 'New session';
		if (path === '/app/admin/audit-log') return 'Audit log';
		if (path === '/app/admin') return 'Users';
		if (isSessionDetailPage) return detailSession?.title ?? 'Session';
		return activeNavItem?.label ?? 'WeOracle';
	});
	const showBackToSessions = $derived(isSessionDetailPage);
	const showNewSessionAction = $derived(path !== '/app/new' && activeNavItem?.id === 'sessions' && !showBackToSessions);
</script>

{#if data.user}
	<div class="wbd-app-shell">
		<AdminSidebar items={navItems}>
			{#snippet logo()}
				<BrandLogo class="wbd-app-shell__brand" href="/app" size="1.75rem" ariaLabel="WeOracle sessions" />
			{/snippet}
		</AdminSidebar>
		<div class="wbd-app-shell__workspace">
			<header class="wbd-app-shell__header">
				<div class="wbd-app-shell__title-block">
					{#if showBackToSessions}
						<a class="wbd-app-shell__back" href="/app" aria-label="Back to sessions">←</a>
					{/if}
					<h1>{headerTitle}</h1>
				</div>
				<div class="wbd-app-shell__actions">
					{#if showNewSessionAction}
						<a class="wbd-app-shell__primary-action" href="/app/new">New session</a>
					{/if}
					<div class="wbd-app-shell__user" title={data.user.name}>{data.user.name}</div>
					<LanguageControl />
					<ThemeModeToggle />
					<form method="POST" action="/app/sign-in?/signOut" class="wbd-app-shell__signout">
						<button type="submit">{t('app.signOut')}</button>
					</form>
				</div>
			</header>
			<main class="wbd-app-shell__content">
				{@render children()}
			</main>
		</div>
	</div>
{:else}
	<main class="wbd-app-shell__content wbd-app-shell__content--bare">
		{@render children()}
	</main>
{/if}

<style>
	.wbd-app-shell {
		--color-background-primary: #fff;
		--color-background-secondary: #f8fafc;
		--color-background-tertiary: #e2e8f0;
		--color-background-hover: #f1f5f9;
		--color-border-primary: #e2e8f0;
		--color-border-secondary: #cbd5e1;
		--color-text-primary: #0f172a;
		--color-text-secondary: #475569;
		--color-text-tertiary: #64748b;

		min-height: 100vh;
		display: flex;
		background: #fff;
	}
	:global(html.dark) .wbd-app-shell {
		--color-background-primary: #081522;
		--color-background-secondary: #0d1c2d;
		--color-background-tertiary: #12263a;
		--color-background-hover: #12263a;
		--color-border-primary: #24354d;
		--color-border-secondary: #334966;
		--color-text-primary: #d6dce4;
		--color-text-secondary: #8fa4c2;
		--color-text-tertiary: #5a7290;

		background: #081522;
	}
	.wbd-app-shell__workspace {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.wbd-app-shell__header {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 4.25rem;
		padding: 0.875rem 2rem;
		border-bottom: 1px solid var(--color-border-primary, #e2e8f0);
		background: #fff;
		box-sizing: border-box;
	}
	:global(html.dark) .wbd-app-shell__header {
		background: #081522;
	}
	.wbd-app-shell__title-block {
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.wbd-app-shell__back {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1;
		text-decoration: none;
	}
	.wbd-app-shell__title-block h1 {
		margin: 0;
		overflow: hidden;
		color: var(--color-text-primary, #0f172a);
		font-size: 1.25rem;
		line-height: 1.2;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.wbd-app-shell__actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.625rem;
		min-width: 0;
	}
	.wbd-app-shell__primary-action,
	:global(.wbd-app-shell__signout button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.25rem;
		padding: 0 0.75rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: #fff;
		color: var(--color-text-primary, #0f172a);
		font-size: 0.8125rem;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		white-space: nowrap;
	}
	:global(html.dark) .wbd-app-shell__primary-action,
	:global(html.dark .wbd-app-shell__signout button) {
		background: #0d1c2d;
	}
	.wbd-app-shell__primary-action {
		border-color: var(--color-primary-600, #2563eb);
		background: var(--color-primary-600, #2563eb);
		color: var(--color-on-primary, #fff);
	}
	:global(html.dark) .wbd-app-shell__primary-action {
		background: var(--color-primary-600, #2563eb);
	}
	.wbd-app-shell__user {
		max-width: 12rem;
		overflow: hidden;
		color: var(--color-text-secondary, #475569);
		font-size: 0.8125rem;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:global(.wbd-app-shell__brand) {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
	}
	.wbd-app-shell__content {
		flex: 1;
		min-width: 0;
		padding: 1.5rem 2rem;
		box-sizing: border-box;
		background: #fff;
		color: var(--color-text-primary, #0f172a);
	}
	:global(html.dark) .wbd-app-shell__content {
		background: #081522;
	}
	.wbd-app-shell__content--bare {
		min-height: 100vh;
	}
	:global(.wbd-app-shell__signout) {
		margin: 0;
	}
	@media (max-width: 760px) {
		.wbd-app-shell {
			flex-direction: column;
		}
		.wbd-app-shell__header {
			position: static;
			align-items: flex-start;
			flex-direction: column;
			padding: 1rem;
		}
		.wbd-app-shell__actions {
			width: 100%;
			flex-wrap: wrap;
			justify-content: flex-start;
		}
		.wbd-app-shell__user {
			max-width: 100%;
		}
		.wbd-app-shell__content {
			padding: 1rem;
		}
	}
</style>
