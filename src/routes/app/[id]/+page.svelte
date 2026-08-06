<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import {
		RoundProgressMonitor,
		SessionExpertInvitePanel,
		SessionLifecycleToolbar
	} from 'stylist-svelte';
	import { toStructExpert, toStructSession } from '$lib/wbd/map';
	import type { WbdRoundView, WbdSessionRow } from '$lib/wbd/types';

	let { data } = $props();

	let localSession = $state<WbdSessionRow>({ ...data.session });
	const session = $derived(toStructSession(localSession));
	const experts = $derived(data.session.experts.map(toStructExpert));
	let sessionSaving = $state(false);
	let sessionMutating = $state(false);
	let sessionSaveMessage = $state('');
	let sessionSaveError = $state('');
	let sessionMutationError = $state('');

	$effect(() => {
		localSession = { ...data.session };
	});

	async function saveSession() {
		if (!localSession.title.trim() || sessionSaving) return;
		sessionSaving = true;
		sessionSaveMessage = '';
		sessionSaveError = '';
		try {
			const res = await fetch(`/api/wbd/sessions/${data.session.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title: localSession.title.trim(),
					description: localSession.description?.trim() || null,
					image_url: localSession.image_url?.trim() || null,
					is_public: localSession.is_public === 1,
					assumptions: localSession.assumptions?.trim() || null,
					max_rounds: localSession.max_rounds
				})
			});
			if (!res.ok) throw new Error(await res.text());
			localSession = (await res.json()) as WbdSessionRow;
			sessionSaveMessage = 'Session saved';
			await invalidateAll();
		} catch {
			sessionSaveError = 'Could not save session';
		} finally {
			sessionSaving = false;
		}
	}

	const actions = $derived.by(() => {
		const s = data.session;
		if (s.status === 'draft') return [{ id: 'open_round' as const, label: 'Start round 1', variant: 'primary' as const }];
		if (s.status === 'completed') return [];
		const isLastRound = s.current_round >= s.max_rounds;
		return [
			{ id: 'reveal_results' as const, label: 'Compute round results' },
			{
				id: 'advance_round' as const,
				label: isLastRound ? 'Finalize session' : `Advance to round ${s.current_round + 1}`,
				variant: 'primary' as const
			}
		];
	});

	function computeProgress(roundView: WbdRoundView) {
		const total = roundView.experts.length;
		const submitted = roundView.experts.filter((expert) =>
			roundView.questions.every((question) =>
				(roundView.answersByQuestion[question.id] ?? []).some(
					(answer) => answer.expert_token === expert.token && answer.submitted_at
				)
			)
		).length;
		return {
			roundNumber: roundView.session.current_round,
			totalExperts: total,
			submittedExperts: submitted,
			pendingExperts: total - submitted
		};
	}

	async function triggerAction(action: { id: string }) {
		if (action.id === 'open_round' || action.id === 'advance_round') {
			await fetch(`/api/wbd/sessions/${data.session.id}`, { method: 'POST' });
		} else if (action.id === 'reveal_results') {
			await fetch(`/api/wbd/sessions/${data.session.id}/snapshot`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ round_number: data.session.current_round })
			});
		}
		await invalidateAll();
	}

	async function resetSession() {
		if (sessionMutating) return;
		if (
			!window.confirm(
				'Reset this session to draft? Answers, discussion messages, round snapshots, reports, and round settings will be removed.'
			)
		) {
			return;
		}

		sessionMutating = true;
		sessionMutationError = '';
		try {
			const res = await fetch(`/api/wbd/sessions/${data.session.id}/reset`, { method: 'POST' });
			if (!res.ok) throw new Error(await res.text());
			localSession = (await res.json()) as WbdSessionRow;
			await invalidateAll();
		} catch {
			sessionMutationError = 'Could not reset session';
		} finally {
			sessionMutating = false;
		}
	}

	async function deleteSession() {
		if (sessionMutating) return;
		if (
			!window.confirm(
				'Delete this session permanently? Questions, answers, discussion, experts, snapshots, reports, and audit entries will be removed.'
			)
		) {
			return;
		}

		sessionMutating = true;
		sessionMutationError = '';
		try {
			const res = await fetch(`/api/wbd/sessions/${data.session.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			await goto('/app');
		} catch {
			sessionMutationError = 'Could not delete session';
			sessionMutating = false;
		}
	}

	async function inviteExpert(email: string) {
		await fetch(`/api/wbd/sessions/${data.session.id}/experts`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email })
		});
		await invalidateAll();
	}

	async function removeExpert(expertId: string) {
		await fetch(`/api/wbd/sessions/${data.session.id}/experts/${expertId}`, { method: 'DELETE' });
		await invalidateAll();
	}

	async function resendInvite(expertId: string) {
		await fetch(`/api/wbd/sessions/${data.session.id}/experts/${expertId}`, { method: 'POST' });
		await invalidateAll();
	}

	let copiedId = $state('');
	function copyInviteLink(expertId: string, token: string) {
		const link = `${location.origin}/invite/${token}`;
		navigator.clipboard.writeText(link);
		copiedId = expertId;
		setTimeout(() => (copiedId = ''), 1500);
	}
</script>

<svelte:head>
	<title>{data.session.title} — WeOracle</title>
</svelte:head>

<div class="wbd-session-page">
	{#if session.description}
		<p class="wbd-session-page__description">{session.description}</p>
	{/if}

	<div class="wbd-session-body">
		<section class="wbd-session-settings">
			<h2>Session settings</h2>
			<form
				onsubmit={(event) => {
					event.preventDefault();
					void saveSession();
				}}
			>
				<label>
					<span>Title</span>
					<input bind:value={localSession.title} required />
				</label>
				<label>
					<span>Description</span>
					<textarea bind:value={localSession.description} rows="3"></textarea>
				</label>
				<label>
					<span>Image URL</span>
					<input
						value={localSession.image_url ?? ''}
						placeholder="/gen/case-capex-project-estimation.png"
						oninput={(event) => {
							localSession.image_url = event.currentTarget.value;
						}}
					/>
				</label>
				<div class="wbd-session-settings__image-preview">
					{#if localSession.image_url}
						<img src={localSession.image_url} alt="" />
						<button
							type="button"
							onclick={() => {
								localSession.image_url = null;
							}}>Remove image</button
						>
					{:else}
						<span>Image preview</span>
					{/if}
				</div>
				<label class="wbd-session-settings__checkbox">
					<input
						type="checkbox"
						checked={localSession.is_public === 1}
						onchange={(event) => {
							localSession.is_public = event.currentTarget.checked ? 1 : 0;
						}}
					/>
					<span>Public poll</span>
					<small>{localSession.is_public === 1 ? 'Anyone with the public link can participate.' : 'Only invited experts can participate.'}</small>
				</label>
				<label>
					<span>Shared assumptions</span>
					<textarea bind:value={localSession.assumptions} rows="5"></textarea>
				</label>
				<label>
					<span>Max rounds</span>
					<input
						type="number"
						min={Math.max(1, localSession.current_round)}
						value={localSession.max_rounds}
						oninput={(event) => {
							localSession.max_rounds = event.currentTarget.valueAsNumber;
						}}
					/>
				</label>
				<div class="wbd-session-settings__footer">
					<button type="submit" disabled={sessionSaving || !localSession.title.trim()}>
						{sessionSaving ? 'Saving...' : 'Save session'}
					</button>
					{#if sessionSaveMessage}
						<span class="wbd-session-settings__success">{sessionSaveMessage}</span>
					{/if}
					{#if sessionSaveError}
						<span class="wbd-session-settings__error">{sessionSaveError}</span>
					{/if}
				</div>
			</form>
			<div class="wbd-session-settings__management">
				<span class="wbd-session-settings__status">{session.status}</span>
				<SessionLifecycleToolbar {session} {actions} onTriggerAction={triggerAction} />
				<a class="wbd-session-settings__secondary-link" href={`/app/questions?session=${data.session.id}`}>Edit questions</a>
				<button type="button" disabled={sessionMutating} onclick={resetSession}>Reset to draft</button>
				<button type="button" disabled={sessionMutating} onclick={deleteSession}>Delete session</button>
				{#if sessionMutationError}
					<span>{sessionMutationError}</span>
				{/if}
			</div>
			{#if data.roundView || data.session.status !== 'draft'}
				<div class="wbd-session-settings__progress">
					{#if data.roundView}
						<RoundProgressMonitor progress={computeProgress(data.roundView)} />
					{/if}
					{#if data.session.status !== 'draft'}
						<div class="wbd-session-settings__links">
							<a class="wbd-round-link" href={`/app/${data.session.id}/round?round=${data.session.current_round}`}>
								View round {data.session.current_round} results &rarr;
							</a>
							<a class="wbd-round-link" href={`/app/${data.session.id}/analytics`}>View analytics &rarr;</a>
						</div>
					{/if}
				</div>
			{/if}
		</section>

		<section>
			<h2>Experts</h2>
			<SessionExpertInvitePanel {experts} onInviteExpert={inviteExpert} onRemoveExpert={removeExpert} onResendInvite={resendInvite} />
			{#if data.session.experts.length > 0}
				<ul class="wbd-invite-links">
					{#each data.session.experts as expert (expert.id)}
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
	</div>
</div>

<style>
	.wbd-session-page {
		display: grid;
		gap: 1rem;
	}
	.wbd-session-page__description {
		margin: 0;
		max-width: 52rem;
		color: var(--color-text-tertiary, #64748b);
		font-size: 0.875rem;
		line-height: 1.5;
	}
	.wbd-round-link {
		display: block;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-primary-600, #2563eb);
		text-decoration: none;
	}
	.wbd-session-body {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.wbd-session-body h2 {
		margin: 0 0 0.75rem;
		font-size: 0.875rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-session-settings {
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f8fafc);
		padding: 1rem;
	}
	.wbd-session-settings form {
		display: grid;
		gap: 0.875rem;
	}
	.wbd-session-settings label {
		display: grid;
		gap: 0.375rem;
	}
	.wbd-session-settings label span {
		color: var(--color-text-secondary, #475569);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.wbd-session-settings input,
	.wbd-session-settings textarea {
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
	.wbd-session-settings textarea {
		resize: vertical;
	}
	.wbd-session-settings__checkbox {
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		column-gap: 0.625rem;
	}
	.wbd-session-settings__checkbox input {
		width: 1rem;
		margin-top: 0.125rem;
		padding: 0;
	}
	.wbd-session-settings__checkbox small {
		grid-column: 2;
		color: var(--color-text-tertiary, #64748b);
		font-size: 0.75rem;
	}
	.wbd-session-settings__image-preview {
		position: relative;
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
	.wbd-session-settings__image-preview img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.wbd-session-settings__image-preview button {
		position: absolute;
		right: 0.625rem;
		bottom: 0.625rem;
		min-height: 2rem;
		padding: 0 0.625rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
	}
	.wbd-session-settings__footer {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.wbd-session-settings__footer button {
		min-height: 2.25rem;
		padding: 0 0.75rem;
		border: 1px solid var(--color-primary-600, #2563eb);
		border-radius: 0.375rem;
		background: var(--color-primary-600, #2563eb);
		color: var(--color-on-primary, #fff);
		font-size: 0.8125rem;
		font-weight: 700;
		cursor: pointer;
	}
	.wbd-session-settings__footer button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.wbd-session-settings__management {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border-primary, #e2e8f0);
	}
	.wbd-session-settings__status {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		padding: 0 0.75rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 999px;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-secondary, #475569);
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
	}
	.wbd-session-settings__management button {
		min-height: 2.25rem;
		padding: 0 0.75rem;
		border: 1px solid var(--color-danger-600, #dc2626);
		border-radius: 0.375rem;
		background: transparent;
		color: var(--color-danger-600, #dc2626);
		font-size: 0.8125rem;
		font-weight: 700;
		cursor: pointer;
	}
	.wbd-session-settings__secondary-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.25rem;
		padding: 0 0.75rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font-size: 0.8125rem;
		font-weight: 700;
		text-decoration: none;
	}
	.wbd-session-settings__management button:last-of-type {
		background: var(--color-danger-600, #dc2626);
		color: var(--color-on-primary, #fff);
	}
	.wbd-session-settings__management button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.wbd-session-settings__management span:not(.wbd-session-settings__status) {
		color: var(--color-danger-600, #dc2626);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.wbd-session-settings__progress {
		display: grid;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	.wbd-session-settings__links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.wbd-session-settings__success,
	.wbd-session-settings__error {
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.wbd-session-settings__success {
		color: var(--color-success-700, #15803d);
	}
	.wbd-session-settings__error {
		color: var(--color-danger-600, #dc2626);
	}
	.wbd-invite-links {
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.wbd-invite-links li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 0.625rem;
		border: 1px dashed var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font-size: 0.75rem;
	}
	.wbd-invite-links button {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.25rem;
		background: var(--color-background-primary, #fff);
		font-size: 0.6875rem;
		cursor: pointer;
	}
</style>
