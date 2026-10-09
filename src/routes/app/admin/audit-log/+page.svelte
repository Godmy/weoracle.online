<script lang="ts">
	import AuditLogPage from '$stylist/wbd/component/template/audit-log-page/index.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Audit log — Admin — WeOracle</title>
</svelte:head>

<AuditLogPage entries={data.entries} />
