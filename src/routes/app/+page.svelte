<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { ActionSegmentedControl } from '$stylist/control/component/atom/action-segmented-control';
	import SessionOverviewPage from '$stylist/wbd/component/template/session-overview-page/index.svelte';
	import { RecordShellLabel } from '$lib/navigation/const/record/shell-label';

	let { data } = $props();

	const labels = $derived(RecordShellLabel[data.lang] ?? RecordShellLabel.en);
	const visibility = $derived(page.url.searchParams.get('visibility'));
	const status = $derived(page.url.searchParams.get('status'));
	const sessions = $derived(
		data.sessions.filter((session) => {
			if (visibility === 'public' && !session.isPublic) return false;
			if (visibility === 'private' && session.isPublic) return false;
			if (status && session.status !== status) return false;
			return true;
		})
	);
	const hasActiveFilter = $derived(Boolean(visibility || status));

	const STATUS_VALUES = ['', 'draft', 'active', 'round_1', 'round_2', 'round_3', 'completed'];
	const statusOptions = $derived(
		STATUS_VALUES.map((value) => (value ? labels.statuses[value] : labels.allFilter))
	);
	const statusIndex = $derived(Math.max(0, STATUS_VALUES.indexOf(status ?? '')));
	const visibilityOptions = $derived([labels.allFilter, labels.publicFilter, labels.privateFilter]);
	const visibilityIndex = $derived(visibility === 'public' ? 1 : visibility === 'private' ? 2 : 0);

	function setParam(name: string, value: string): void {
		const url = new URL(page.url);
		if (value) url.searchParams.set(name, value);
		else url.searchParams.delete(name);
		goto(`${url.pathname}${url.search}`, { keepFocus: true, noScroll: true, replaceState: true });
	}
</script>

<svelte:head>
	<title>Sessions — WeOracle</title>
</svelte:head>

<div class="wbd-session-filters">
	<div class="wbd-session-filters__row" role="group" aria-label={labels.statusFilter}>
		<ActionSegmentedControl
			items={statusOptions}
			selectedIndex={statusIndex}
			onValueChange={(index: number) => setParam('status', STATUS_VALUES[index] ?? '')}
		/>
	</div>
	<div class="wbd-session-filters__row" role="group" aria-label={labels.visibilityFilter}>
		<ActionSegmentedControl
			items={visibilityOptions}
			selectedIndex={visibilityIndex}
			onValueChange={(index: number) =>
				setParam('visibility', index === 1 ? 'public' : index === 2 ? 'private' : '')}
		/>
	</div>
</div>

<SessionOverviewPage {sessions} {hasActiveFilter} />

<style>
	.wbd-session-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}
	/* Phones: each filter is a single swipeable row instead of wrapping segments. */
	.wbd-session-filters__row {
		max-width: 100%;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.wbd-session-filters__row > :global(*) {
		flex-wrap: nowrap;
		white-space: nowrap;
	}
</style>
