<script lang="ts">
	import { page } from '$app/state';
	import SessionOverviewPage from '$stylist/wbd/component/template/session-overview-page/index.svelte';

	let { data } = $props();

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
</script>

<svelte:head>
	<title>Sessions — WeOracle</title>
</svelte:head>

<SessionOverviewPage {sessions} {hasActiveFilter} />
