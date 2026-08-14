<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import {
		RoundProgressMonitor,
		SessionLifecycleToolbar,
		WbdEditSession
	} from 'stylist-svelte';
	import type { StructWbdSession } from 'stylist-svelte';
	import { toStructSession } from '$lib/wbd/map';
	import type { WbdRoundView, WbdSessionRow } from '$lib/wbd/types';

	let { data } = $props();

	let localSession = $state<WbdSessionRow>({ ...data.session });
	const session = $derived(toStructSession(localSession));
	let sessionSaving = $state(false);
	let sessionMutating = $state(false);
	let sessionSaveMessage = $state('');
	let sessionSaveError = $state('');
	let sessionMutationError = $state('');

	$effect(() => {
		localSession = { ...data.session };
	});

	function updateSessionDraft(next: Partial<StructWbdSession>) {
		if ('title' in next) localSession.title = next.title ?? '';
		if ('description' in next) localSession.description = next.description ?? null;
		if ('imageUrl' in next) localSession.image_url = next.imageUrl ?? null;
		if ('isPublic' in next) localSession.is_public = next.isPublic ? 1 : 0;
		if ('assumptions' in next) localSession.assumptions = next.assumptions ?? null;
		if ('maxRounds' in next) localSession.max_rounds = next.maxRounds ?? localSession.max_rounds;
	}

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
			<WbdEditSession
				{session}
				mode="edit"
				minMaxRounds={Math.max(1, localSession.current_round)}
				saving={sessionSaving}
				saveMessage={sessionSaveMessage}
				saveError={sessionSaveError}
				onUpdateSession={updateSessionDraft}
				onSubmit={saveSession}
			/>
			<div class="wbd-session-settings__management">
				<span class="wbd-session-settings__status">{session.status}</span>
				<SessionLifecycleToolbar {session} {actions} onTriggerAction={triggerAction} />
				<a class="wbd-session-settings__secondary-link" href={`/app/questions?session=${data.session.id}`}>Edit questions</a>
				<a class="wbd-session-settings__secondary-link" href={`/app/experts?session=${data.session.id}`}>Manage experts</a>
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
</style>
