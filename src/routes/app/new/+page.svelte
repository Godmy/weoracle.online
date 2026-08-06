<script lang="ts">
	import { goto } from '$app/navigation';
	import { SessionSetupWizard } from 'stylist-svelte';

	let { data } = $props();

	let session = $state<{ title?: string; description?: string; imageUrl?: string; isPublic?: boolean; assumptions?: string; maxRounds?: number }>({
		maxRounds: 3
	});
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
	{#if errorMessage}
		<p class="wbd-new-session__error">{errorMessage}</p>
	{/if}
	<section class="wbd-new-session__image">
		<label>
			<span>Image URL</span>
			<input
				value={session.imageUrl ?? ''}
				placeholder="/gen/case-capex-project-estimation.png"
				oninput={(event) => {
					session = { ...session, imageUrl: event.currentTarget.value };
				}}
			/>
		</label>
		<div class="wbd-new-session__image-preview">
			{#if session.imageUrl}
				<img src={session.imageUrl} alt="" />
			{:else}
				<span>Image preview</span>
			{/if}
		</div>
		<label class="wbd-new-session__checkbox">
			<input
				type="checkbox"
				checked={Boolean(session.isPublic)}
				onchange={(event) => {
					session = { ...session, isPublic: event.currentTarget.checked };
				}}
			/>
			<span>Public poll</span>
			<small>{session.isPublic ? 'Anyone with the public link can participate.' : 'Only invited experts can participate.'}</small>
		</label>
	</section>
	<SessionSetupWizard {session} onUpdateSession={(next) => (session = { ...session, ...next })} onCreateSession={createSession} />
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
	.wbd-new-session__error {
		color: var(--color-danger-600, #dc2626);
		font-size: 0.8125rem;
	}
	.wbd-new-session__image {
		display: grid;
		gap: 0.75rem;
		max-width: 40rem;
		padding: 1rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f8fafc);
	}
	.wbd-new-session__image label {
		display: grid;
		gap: 0.375rem;
	}
	.wbd-new-session__image label span {
		color: var(--color-text-secondary, #475569);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.wbd-new-session__image input {
		box-sizing: border-box;
		width: 100%;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font: inherit;
		font-size: 0.875rem;
		padding: 0.625rem 0.75rem;
	}
	.wbd-new-session__image-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 9;
		border: 1px dashed var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-tertiary, #64748b);
		font-size: 0.8125rem;
		overflow: hidden;
	}
	.wbd-new-session__image-preview img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.wbd-new-session__checkbox {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		column-gap: 0.625rem;
	}
	.wbd-new-session__checkbox input {
		width: 1rem;
		margin-top: 0.125rem;
	}
	.wbd-new-session__checkbox small {
		grid-column: 2;
		color: var(--color-text-tertiary, #64748b);
		font-size: 0.75rem;
	}
</style>
