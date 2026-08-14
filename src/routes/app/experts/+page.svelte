<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { SessionExpertInvitePanel } from 'stylist-svelte';
	import { toStructExpert } from '$lib/wbd/map';

	let { data } = $props();

	let selectedSessionId = $state(data.selectedSessionId);
	let copiedId = $state('');
	const selectedSession = $derived(data.sessions.find((session) => session.id === selectedSessionId));
	const experts = $derived(data.experts.map(toStructExpert));
	const joinedExperts = $derived(data.experts.filter((expert) => expert.status === 'joined').length);
	const invitedExperts = $derived(data.experts.filter((expert) => expert.status === 'invited').length);

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

	function copyInviteLink(expertId: string, token: string) {
		const link = `${location.origin}/invite/${token}`;
		navigator.clipboard.writeText(link);
		copiedId = expertId;
		setTimeout(() => (copiedId = ''), 1500);
	}
</script>

<svelte:head>
	<title>Experts - WeOracle</title>
</svelte:head>

<section class="wbd-experts-page">
	<section class="wbd-experts-page__toolbar" aria-label="Expert session selector">
		<label>
			<span>Session</span>
			<select
				value={selectedSessionId}
				onchange={(event) => {
					void selectSession(event.currentTarget.value);
				}}
			>
				{#each data.sessions as session (session.id)}
					<option value={session.id}>{session.title}</option>
				{/each}
			</select>
		</label>
		{#if selectedSession}
			<a href={`/app/${selectedSession.id}`}>Session settings</a>
		{/if}
	</section>

	{#if selectedSession}
		<section class="wbd-experts-page__summary">
			<article>
				<span>Total experts</span>
				<strong>{data.experts.length}</strong>
			</article>
			<article>
				<span>Joined</span>
				<strong>{joinedExperts}</strong>
			</article>
			<article>
				<span>Invited</span>
				<strong>{invitedExperts}</strong>
			</article>
		</section>

		<section class="wbd-experts-page__panel">
			<SessionExpertInvitePanel {experts} onInviteExpert={inviteExpert} onRemoveExpert={removeExpert} onResendInvite={resendInvite} />
			{#if data.experts.length > 0}
				<ul class="wbd-experts-page__invite-links">
					{#each data.experts as expert (expert.id)}
						<li>
							<span>{expert.alias}</span>
							<button type="button" onclick={() => copyInviteLink(expert.id, expert.token)}>
								{copiedId === expert.id ? 'Copied!' : 'Copy invite link'}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{:else}
		<section class="wbd-experts-page__empty">
			<p>No sessions yet.</p>
			<a href="/app/new">Create session</a>
		</section>
	{/if}
</section>

<style>
	.wbd-experts-page {
		display: grid;
		gap: 1rem;
	}
	.wbd-experts-page__toolbar,
	.wbd-experts-page__panel,
	.wbd-experts-page__empty {
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f8fafc);
		padding: 1rem;
	}
	.wbd-experts-page__toolbar {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}
	.wbd-experts-page__toolbar label {
		display: grid;
		gap: 0.375rem;
		width: min(100%, 28rem);
	}
	.wbd-experts-page__toolbar span {
		color: var(--color-text-secondary, #64748b);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.wbd-experts-page__toolbar select {
		width: 100%;
		min-height: 2.5rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font: inherit;
		padding: 0 0.75rem;
	}
	.wbd-experts-page__toolbar a,
	.wbd-experts-page__empty a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.5rem;
		padding: 0 0.75rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font-size: 0.8125rem;
		font-weight: 700;
		text-decoration: none;
	}
	.wbd-experts-page__summary {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
	}
	.wbd-experts-page__summary article {
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f8fafc);
		padding: 1rem;
	}
	.wbd-experts-page__summary span {
		display: block;
		color: var(--color-text-secondary, #64748b);
		font-size: 0.8125rem;
	}
	.wbd-experts-page__summary strong {
		display: block;
		margin-top: 0.375rem;
		color: var(--color-text-primary, #0f172a);
		font-size: 1.25rem;
	}
	.wbd-experts-page__invite-links {
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.wbd-experts-page__invite-links li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 0.625rem;
		border: 1px dashed var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font-size: 0.75rem;
	}
	.wbd-experts-page__invite-links button {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.25rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font-size: 0.6875rem;
		cursor: pointer;
	}
	.wbd-experts-page__empty {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.wbd-experts-page__empty p {
		margin: 0;
		color: var(--color-text-secondary, #64748b);
	}
	@media (max-width: 760px) {
		.wbd-experts-page__toolbar,
		.wbd-experts-page__empty {
			align-items: stretch;
			flex-direction: column;
		}
		.wbd-experts-page__summary {
			grid-template-columns: 1fr;
		}
	}
</style>
