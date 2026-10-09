<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import UserManagementPage from '$stylist/wbd/component/template/user-management-page/index.svelte';

	let { data } = $props();

	let selectedUserId = $state('');

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

<UserManagementPage
	users={data.users}
	{selectedUserId}
	onSelectUser={(id) => (selectedUserId = id)}
	onUpdateUserRole={updateRole}
	onAssignRole={updateRole}
/>
