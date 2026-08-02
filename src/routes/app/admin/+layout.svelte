<script lang="ts">
	import { goto } from '$app/navigation';
	import { PermissionDeniedPanel } from 'stylist-svelte';

	let { data, children } = $props();
</script>

{#if data.isAdmin}
	<nav class="wbd-admin-nav">
		<a href="/app/admin">Users</a>
		<a href="/app/admin/audit-log">Audit log</a>
	</nav>
	{@render children()}
{:else}
	<PermissionDeniedPanel
		title="Admins only"
		description="This section is restricted to admin accounts."
		actionLabel="Back to sessions"
		onGoBack={() => goto('/app')}
	/>
{/if}

<style>
	.wbd-admin-nav {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		font-size: 0.8125rem;
	}
	.wbd-admin-nav a {
		color: var(--color-text-secondary, #475569);
		text-decoration: none;
		font-weight: 600;
	}
</style>
