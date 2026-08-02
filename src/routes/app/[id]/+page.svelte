<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		RoundProgressMonitor,
		SessionDetailLayout,
		SessionExpertInvitePanel,
		SessionLifecycleToolbar,
		SessionQuestionEditor
	} from 'stylist-svelte';
	import { toStructExpert, toStructQuestion, toStructSession } from '$lib/wbd/map';
	import type { WbdRoundView } from '$lib/wbd/types';

	let { data } = $props();

	const session = $derived(toStructSession(data.session));
	const questions = $derived(data.session.questions.map(toStructQuestion));
	const experts = $derived(data.session.experts.map(toStructExpert));
	let selectedQuestionId = $state(data.session.questions[0]?.id ?? '');

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

	async function createQuestion() {
		const res = await fetch(`/api/wbd/sessions/${data.session.id}/questions`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: 'New question', type: 'numeric' })
		});
		const created = (await res.json()) as { id?: string };
		if (created.id) selectedQuestionId = created.id;
		await invalidateAll();
	}

	async function updateQuestion(question: { id: string }) {
		await fetch(`/api/wbd/questions/${question.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(question)
		});
		await invalidateAll();
	}

	async function deleteQuestion(questionId: string) {
		const remaining = data.session.questions.filter((question) => question.id !== questionId);
		if (selectedQuestionId === questionId) selectedQuestionId = remaining[0]?.id ?? '';
		await fetch(`/api/wbd/questions/${questionId}`, { method: 'DELETE' });
		await invalidateAll();
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

<a href="/app" class="wbd-back">&larr; Sessions</a>

<SessionDetailLayout {session}>
	{#snippet sidebar()}
		<SessionLifecycleToolbar {session} {actions} onTriggerAction={triggerAction} />
		{#if data.roundView}
			<RoundProgressMonitor progress={computeProgress(data.roundView)} />
		{/if}
		{#if data.session.status !== 'draft'}
			<a class="wbd-round-link" href={`/app/${data.session.id}/round?round=${data.session.current_round}`}>
				View round {data.session.current_round} results &rarr;
			</a>
		{/if}
	{/snippet}

	<div class="wbd-session-body">
		<section>
			<h2>Questions</h2>
			<SessionQuestionEditor
				{questions}
				{selectedQuestionId}
				onSelectQuestion={(questionId) => (selectedQuestionId = questionId)}
				onCreateQuestion={createQuestion}
				onUpdateQuestion={updateQuestion}
				onDeleteQuestion={deleteQuestion}
			/>
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
</SessionDetailLayout>

<style>
	.wbd-back {
		display: inline-block;
		margin-bottom: 1rem;
		font-size: 0.8125rem;
		color: var(--color-text-tertiary, #64748b);
		text-decoration: none;
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
		font-size: 1rem;
		color: var(--color-text-primary, #0f172a);
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
