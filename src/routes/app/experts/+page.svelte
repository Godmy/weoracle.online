<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import ExpertManagementPage from '$stylist/wbd/component/template/expert-management-page/index.svelte';

	let { data } = $props();

	let selectedSessionId = $state(data.selectedSessionId);

	$effect(() => {
		selectedSessionId = data.selectedSessionId;
	});

	async function selectSession(sessionId: string) {
		selectedSessionId = sessionId;
		await goto(sessionId ? `/app/experts?session=${sessionId}` : '/app/experts');
	}

	async function inviteExpert(email: string) {
		if (!selectedSessionId) return;
		await fetch(`/api/wbd/sessions/${selectedSessionId}/experts`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email })
		});
		await invalidateAll();
	}

	async function removeExpert(expertId: string) {
		if (!selectedSessionId) return;
		await fetch(`/api/wbd/sessions/${selectedSessionId}/experts/${expertId}`, { method: 'DELETE' });
		await invalidateAll();
	}

	async function resendInvite(expertId: string) {
		if (!selectedSessionId) return;
		await fetch(`/api/wbd/sessions/${selectedSessionId}/experts/${expertId}`, { method: 'POST' });
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Experts - WeOracle</title>
</svelte:head>

<ExpertManagementPage
	sessions={data.sessions}
	{selectedSessionId}
	experts={data.experts}
	onSelectSession={selectSession}
	onInviteExpert={inviteExpert}
	onRemoveExpert={removeExpert}
	onResendInvite={resendInvite}
	sessionSettingsHref={(sessionId) => `/app/${sessionId}`}
/>
