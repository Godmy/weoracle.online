<script lang="ts">
	import { AuditLogPanel } from 'stylist-svelte';
	import { toStructAuditLogEntry } from '$lib/wbd/map';

	let { data } = $props();

	const entries = $derived(data.entries.map(toStructAuditLogEntry));
</script>

<svelte:head>
	<title>Audit log — Admin — WeOracle</title>
</svelte:head>

<h1>Audit log</h1>

<AuditLogPanel {entries} />

<style>
	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.375rem;
		color: var(--color-text-primary, #0f172a);
	}
</style>
