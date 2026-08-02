<script lang="ts">
	import { goto } from '$app/navigation';
	import { SessionList } from 'stylist-svelte';
	import { toStructSession } from '$lib/wbd/map';

	let { data } = $props();
	const sessions = $derived(data.sessions.map(toStructSession));
</script>

<svelte:head>
	<title>Sessions — WeOracle</title>
</svelte:head>

<SessionList
	{sessions}
	onSelectSession={(id) => goto(`/app/${id}`)}
	onCreateSession={() => goto('/app/new')}
/>
