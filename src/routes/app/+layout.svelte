<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Activity from '$stylist/navigation/component/page/activity/index.svelte';
	import FloatingActionButton from '$stylist/navigation/component/atom/floating-action-button/index.svelte';
	import Fragment from '$stylist/navigation/component/template/fragment/index.svelte';
	import TopAppBar from '$stylist/navigation/component/organism/top-app-bar/index.svelte';
	import { resolveNavigationDestination } from '$stylist/navigation/function/resolve/navigation-destination';
	import { resolveNavigationHref } from '$stylist/navigation/function/resolve/navigation-href';
	import type { ContractNavigationDestination } from '$stylist/navigation/interface/contract/navigation-destination';
	import type { ContractNavigationEntry } from '$stylist/navigation/interface/contract/navigation-entry';
	import LanguageControl from '$lib/i18n/component/molecule/language/index.svelte';
	import BrandLogo from '$lib/brand/component/molecule/logo/index.svelte';
	import AccountSheet from '$lib/navigation/component/molecule/account-sheet/index.svelte';
	import { buildAppGraph } from '$lib/navigation/function/build/app-graph';
	import { RecordShellLabel } from '$lib/navigation/const/record/shell-label';
	import { t } from '$lib/i18n/function/translate';

	let { data, children } = $props();

	// Sign-in screens stay outside the activity even for a signed-in user: `/app/sign-in`
	// would otherwise match the `/app/:id` session destination.
	const AUTH_PATHS = ['/app/sign-in', '/app/magic-link', '/app/verify'];

	const labels = $derived(RecordShellLabel[data.lang] ?? RecordShellLabel.en);
	const sessionTitle = $derived.by(() => {
		const pageData = page.data as {
			session?: { title?: string };
			roundView?: { session?: { title?: string } };
		};
		return pageData.session?.title ?? pageData.roundView?.session?.title;
	});

	const graph = $derived(
		buildAppGraph({
			labels: {
				app: 'WeOracle',
				sessions: t('nav.sessions'),
				newSession: labels.newSession,
				session: labels.session,
				round: labels.round,
				sessionAnalytics: labels.sessionAnalytics,
				setup: labels.setup,
				questions: t('nav.questions'),
				experts: labels.experts,
				results: labels.results,
				estimates: t('nav.estimates'),
				discussions: t('nav.discussions'),
				analytics: t('nav.analytics'),
				reports: t('nav.reports'),
				administration: labels.administration,
				users: labels.users,
				auditLog: labels.auditLog
			},
			isAdmin: data.user?.role === 'admin',
			sessionTitle
		})
	);

	// The URL is the source of truth: links inside the pages, reloads and the browser Back
	// button move the activity through `current`; drawer, Up and FAB navigation call `goto`.
	const location = $derived(resolveNavigationDestination(graph, page.url.pathname));
	const inActivity = $derived(Boolean(data.user) && !AUTH_PATHS.includes(page.url.pathname));

	function findDestination(
		node: ContractNavigationDestination,
		id: string
	): ContractNavigationDestination | undefined {
		if (node.id === id) return node;
		for (const child of node.destinations ?? []) {
			const found = findDestination(child, id);
			if (found) return found;
		}
		return undefined;
	}

	function handleNavigate(entry: ContractNavigationEntry) {
		const destination = findDestination(graph, entry.id);
		// Inner session screens keep the open session when the entry has no args of its own.
		const href = destination
			? resolveNavigationHref(destination, { ...location?.args, ...entry.args })
			: undefined;
		if (href && href !== page.url.pathname) goto(href);
	}
</script>

{#if inActivity && data.user}
	<Activity
		class="wbd-app-shell"
		{graph}
		heading="WeOracle"
		current={location?.destination.id}
		currentArgs={location?.args}
		onNavigate={handleNavigate}
	>
		{#snippet drawerHeader()}
			<BrandLogo
				class="wbd-app-shell__brand"
				href="/app"
				size="1.75rem"
				ariaLabel="WeOracle sessions"
			/>
		{/snippet}
		{#snippet actions()}
			<AccountSheet user={data.user!} {labels} signOutLabel={t('app.signOut')} />
		{/snippet}
		{#snippet fab(navigator)}
			{#if navigator.destination.id === 'session-list'}
				<FloatingActionButton
					label={labels.newSession}
					onclick={() => navigator.navigate('create-session')}
				/>
			{/if}
		{/snippet}
		{#snippet fragment()}
			<Fragment layout="wide" class="wbd-app-shell__fragment">
				{@render children()}
			</Fragment>
		{/snippet}
	</Activity>
{:else}
	<div class="wbd-app-shell wbd-app-shell--bare">
		<TopAppBar navigation="none">
			{#snippet leading()}
				<BrandLogo class="wbd-app-shell__brand" href="/" size="1.75rem" ariaLabel="WeOracle" />
			{/snippet}
			{#snippet actions()}
				<LanguageControl />
			{/snippet}
		</TopAppBar>
		<main class="wbd-app-shell__bare-content">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	:global(.wbd-app-shell) {
		--color-background-primary: #fff;
		--color-background-secondary: #f8fafc;
		--color-background-tertiary: #e2e8f0;
		--color-background-hover: #f1f5f9;
		--color-border-primary: #e2e8f0;
		--color-border-secondary: #cbd5e1;
		--color-text-primary: #0f172a;
		--color-text-secondary: #475569;
		--color-text-tertiary: #64748b;

		background: var(--color-background-primary);
		color: var(--color-text-primary);
	}
	:global(html.dark .wbd-app-shell) {
		--color-background-primary: #081522;
		--color-background-secondary: #0d1c2d;
		--color-background-tertiary: #12263a;
		--color-background-hover: #12263a;
		--color-border-primary: #24354d;
		--color-border-secondary: #334966;
		--color-text-primary: #d6dce4;
		--color-text-secondary: #8fa4c2;
		--color-text-tertiary: #5a7290;
	}
	:global(.wbd-app-shell__brand) {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
	}
	/* Room for the extended FAB above the last row of the page. */
	:global(.wbd-app-shell .wbd-app-shell__fragment) {
		padding-bottom: 6rem;
	}
	.wbd-app-shell--bare {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}
	.wbd-app-shell__bare-content {
		flex: 1;
		min-width: 0;
	}
</style>
