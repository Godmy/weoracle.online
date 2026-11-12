<script lang="ts">
	import { goto } from '$app/navigation';
	import PermissionDeniedPanel from '$stylist/wbd/component/organism/permission-denied-panel/index.svelte';

	// Users / Audit log are drawer destinations of the app shell, so no local tab row here.
	let { data, children } = $props();
</script>

{#if data.isAdmin}
	{@render children()}
{:else}
	<PermissionDeniedPanel
		title="Admins only"
		description="This section is restricted to admin accounts."
		actionLabel="Back to sessions"
		onGoBack={() => goto('/app')}
	/>
{/if}
