<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { RoleAssignmentPanel, UserManagementTable } from 'stylist-svelte';
	import { toStructUser } from '$lib/wbd/map';

	let { data } = $props();

	const users = $derived(data.users.map(toStructUser));
	let selectedUserId = $state('');
	const selectedUser = $derived(users.find((u) => u.id === selectedUserId));

	async function updateRole(userId: string, role: 'coordinator' | 'expert' | 'admin') {
		await fetch(`/api/wbd/users/${userId}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ role })
		});
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Users — Admin — WeOracle</title>
</svelte:head>

<h1>Users</h1>

<UserManagementTable {users} {selectedUserId} onSelectUser={(id) => (selectedUserId = id)} onUpdateUserRole={updateRole} />

{#if selectedUser}
	<section>
		<h2>Assign role</h2>
		<RoleAssignmentPanel user={selectedUser} onAssignRole={updateRole} />
	</section>
{/if}

<style>
	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.375rem;
		color: var(--color-text-primary, #0f172a);
	}
	section {
		margin-top: 2rem;
		max-width: 24rem;
	}
	section h2 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		color: var(--color-text-primary, #0f172a);
	}
</style>
