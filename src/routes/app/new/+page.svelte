<script lang="ts">
	import { goto } from '$app/navigation';
	import WbdEditSession from '$stylist/wbd/component/organism/wbd-edit-session/index.svelte';
	import type { StructWbdSession } from '$stylist/wbd/type/object/session';

	let { data } = $props();

	let session = $state<Partial<StructWbdSession>>({ maxRounds: 3 });
	let creating = $state(false);
	let errorMessage = $state('');

	async function createSession() {
		if (!session.title?.trim() || creating) return;
		creating = true;
		errorMessage = '';
		try {
			const res = await fetch('/api/wbd/sessions', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title: session.title,
					description: session.description || undefined,
					image_url: session.imageUrl || undefined,
					is_public: Boolean(session.isPublic),
					assumptions: session.assumptions || undefined,
					max_rounds: session.maxRounds ?? 3,
					created_by: data.user!.id
				})
			});
			if (!res.ok) throw new Error(await res.text());
			const created = (await res.json()) as { id: string };
			goto(`/app/${created.id}`);
		} catch {
			errorMessage = 'Could not create the session — please try again.';
			creating = false;
		}
	}
</script>

<svelte:head>
	<title>New session — WeOracle</title>
</svelte:head>

<div class="wbd-new-session">
	<a href="/app">&larr; Sessions</a>
	<h1>New Wideband Delphi session</h1>
	<WbdEditSession
		{session}
		mode="create"
		saving={creating}
		saveError={errorMessage}
		onUpdateSession={(next) => (session = { ...session, ...next })}
		onSubmit={createSession}
	/>
</div>

<style>
	.wbd-new-session {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.wbd-new-session a {
		align-self: flex-start;
		font-size: 0.8125rem;
		color: var(--color-text-tertiary, #64748b);
		text-decoration: none;
	}
	.wbd-new-session h1 {
		margin: 0;
		font-size: 1.375rem;
		color: var(--color-text-primary, #0f172a);
	}
</style>
