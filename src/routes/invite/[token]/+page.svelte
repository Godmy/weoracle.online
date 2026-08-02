<script lang="ts">
	import { browser } from '$app/environment';
	import {
		ExpertInviteLanding,
		ExpertQuestionNavigator,
		ExpertQuestionnaire,
		ExpertSessionBriefing,
		QuestionDiscussionPanel,
		ThemeProvider
	} from 'stylist-svelte';
	import { toStructAnswer, toStructDiscussionMessage, toStructQuestion } from '$lib/wbd/map';
	import type { WbdDiscussionMessageRow } from '$lib/wbd/types';

	let { data } = $props();

	const acceptedKey = `wbd-invite-accepted-${data.token}`;
	let accepted = $state(browser ? localStorage.getItem(acceptedKey) === '1' : false);
	let declined = $state(false);

	const questions = $derived(data.questions.map(toStructQuestion));
	let answers = $state(Object.fromEntries(data.answers.map((a) => [a.question_id, toStructAnswer(a)])));

	let currentQuestionId = $state(data.questions[0]?.id ?? '');

	async function submitAnswerCommon(answer: { questionId: string }, submitted: boolean) {
		const res = await fetch(`/api/wbd/questions/${answer.questionId}/answers`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				round_number: data.session.current_round,
				expert_token: data.token,
				...answer
			})
		});
		if (res.ok) {
			const row = await res.json();
			answers = { ...answers, [answer.questionId]: toStructAnswer(row) };
		}
		return submitted;
	}

	let discussionRounds = $derived(Array.from({ length: data.session.current_round }, (_, i) => i + 1));
	let discussionMessages = $state<WbdDiscussionMessageRow[]>([]);
	let discussionRound = $state(data.session.current_round);

	async function loadDiscussion() {
		if (!currentQuestionId) return;
		const res = await fetch(
			`/api/wbd/questions/${currentQuestionId}/discussion?round=${discussionRound}&expert_token=${data.token}`
		);
		discussionMessages = res.ok ? await res.json() : [];
	}
	$effect(() => {
		currentQuestionId;
		discussionRound;
		loadDiscussion();
	});

	async function submitMessage(message: string, parentId?: string) {
		await fetch(`/api/wbd/questions/${currentQuestionId}/discussion`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ round_number: discussionRound, expert_token: data.token, message, parentId })
		});
		await loadDiscussion();
	}
</script>

<svelte:head>
	<title>{data.session.title} — WeOracle</title>
</svelte:head>

<ThemeProvider theme-mode="light">
	<div class="wbd-invite-page">
		{#if declined}
			<p class="wbd-invite-page__note">You've declined this invite. You may close this tab.</p>
		{:else if data.session.status === 'draft'}
			<ExpertSessionBriefing
				sessionTitle={data.session.title}
				description={data.session.description ?? undefined}
				assumptions={data.session.assumptions ?? undefined}
				currentRound={data.session.current_round}
				maxRounds={data.session.max_rounds}
				questionCount={data.questions.length}
			/>
			<p class="wbd-invite-page__note">Waiting for the coordinator to start round 1.</p>
		{:else if !accepted}
			<ExpertInviteLanding
				sessionTitle={data.session.title}
				alias={data.expert.alias}
				onAcceptInvite={() => {
					accepted = true;
					if (browser) localStorage.setItem(acceptedKey, '1');
				}}
				onDeclineInvite={() => (declined = true)}
			/>
		{:else}
			<ExpertSessionBriefing
				sessionTitle={data.session.title}
				description={data.session.description ?? undefined}
				assumptions={data.session.assumptions ?? undefined}
				currentRound={data.session.current_round}
				maxRounds={data.session.max_rounds}
				questionCount={data.questions.length}
			/>

			<div class="wbd-invite-page__grid">
				<aside>
					<ExpertQuestionNavigator {questions} {answers} {currentQuestionId} onSelectQuestion={(id) => (currentQuestionId = id)} />
				</aside>
				<main>
					<ExpertQuestionnaire
						{questions}
						{answers}
						{currentQuestionId}
						onSaveAnswer={(answer) => submitAnswerCommon(answer, false)}
						onSubmitAnswer={(answer) => submitAnswerCommon(answer, true)}
					/>

					{#if currentQuestionId}
						{@const question = questions.find((q) => q.id === currentQuestionId)}
						{#if question}
							<QuestionDiscussionPanel
								{question}
								messages={discussionMessages.map((m) => toStructDiscussionMessage(m, data.token))}
								rounds={discussionRounds}
								selectedRound={discussionRound}
								onSelectRound={(round) => (discussionRound = round)}
								onSubmitMessage={submitMessage}
							/>
						{/if}
					{/if}
				</main>
			</div>
		{/if}
	</div>
</ThemeProvider>

<style>
	.wbd-invite-page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.wbd-invite-page__note {
		font-size: 0.875rem;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-invite-page__grid {
		display: grid;
		grid-template-columns: minmax(14rem, 18rem) 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	.wbd-invite-page__grid main {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	@media (max-width: 760px) {
		.wbd-invite-page__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
