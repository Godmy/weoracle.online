<script lang="ts">
	import { browser } from '$app/environment';
	import {
		ExpertInviteLanding,
		ExpertQuestionNavigator,
		ExpertQuestionnaire,
		ExpertSessionBriefing,
		QuestionDiscussionPanel
	} from 'stylist-svelte';
	import { toStructAnswer, toStructDiscussionMessage, toStructQuestion } from '$lib/wbd/map';
	import type { WbdDiscussionMessageRow } from '$lib/wbd/types';
	import { t } from '$lib/i18n';

	let { data } = $props();

	const acceptedKey = `wbd-invite-accepted-${data.token}`;
	let accepted = $state(browser ? localStorage.getItem(acceptedKey) === '1' : false);
	let declined = $state(false);
	let deviceLayout = $state<'desktop' | 'mobile'>('desktop');
	const isMobileLayout = $derived(deviceLayout === 'mobile');

	$effect(() => {
		const media = window.matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 900px)');
		const updateDeviceLayout = () => {
			deviceLayout = media.matches ? 'mobile' : 'desktop';
		};

		updateDeviceLayout();
		media.addEventListener('change', updateDeviceLayout);

		return () => media.removeEventListener('change', updateDeviceLayout);
	});

	const questions = $derived(data.questions.map(toStructQuestion));
	let answers = $state(Object.fromEntries(data.answers.map((a) => [a.question_id, toStructAnswer(a)])));

	let currentQuestionId = $state(data.questions[0]?.id ?? '');
	const currentQuestion = $derived(questions.find((question) => question.id === currentQuestionId) ?? questions[0]);
	const submittedCount = $derived(questions.filter((question) => answers[question.id]?.submitted).length);

	async function submitAnswer(answer: { questionId: string }) {
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

<div class="wbd-invite-page" class:wbd-invite-page--mobile={isMobileLayout} class:wbd-invite-page--desktop={!isMobileLayout}>
	{#if declined}
		<p class="wbd-invite-page__note">{t('invite.declined')}</p>
	{:else if data.session.status === 'draft'}
		<ExpertSessionBriefing
			sessionTitle={data.session.title}
			description={data.session.description ?? undefined}
			assumptions={data.session.assumptions ?? undefined}
			currentRound={data.session.current_round}
			maxRounds={data.session.max_rounds}
			questionCount={data.questions.length}
		/>
		<p class="wbd-invite-page__note">{t('invite.waiting')}</p>
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
		{#if isMobileLayout}
			<div class="wbd-invite-page__mobile">
				<header class="wbd-invite-page__mobile-header">
					<p>{t('invite.roundOf', { round: data.session.current_round, max: data.session.max_rounds })}</p>
					<h1>{data.session.title}</h1>
					{#if data.session.description}
						<span>{data.session.description}</span>
					{/if}
					{#if data.session.assumptions}
						<details>
							<summary>{t('invite.assumptions')}</summary>
							<div>{data.session.assumptions}</div>
						</details>
					{/if}
				</header>

				<section class="wbd-invite-page__mobile-nav" aria-label={t('invite.questionsNav')}>
					<div class="wbd-invite-page__mobile-nav-header">
						<span>{t('invite.questionOf', { n: currentQuestion ? currentQuestion.orderIndex + 1 : 0, total: questions.length })}</span>
						<span>{t('invite.submittedOf', { submitted: submittedCount, total: questions.length })}</span>
					</div>
					<div class="wbd-invite-page__mobile-question-strip">
						{#each questions as question (question.id)}
							<button
								type="button"
								class:wbd-invite-page__mobile-question--active={question.id === currentQuestionId}
								class:wbd-invite-page__mobile-question--done={answers[question.id]?.submitted}
								aria-current={question.id === currentQuestionId ? 'step' : undefined}
								aria-label={`Question ${question.orderIndex + 1}: ${question.text}`}
								onclick={() => (currentQuestionId = question.id)}
							>
								<span>{question.orderIndex + 1}</span>
								<strong>{question.text}</strong>
							</button>
						{/each}
					</div>
				</section>

				<ExpertQuestionnaire
					{questions}
					{answers}
					{currentQuestionId}
					onSubmitAnswer={submitAnswer}
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
			</div>
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
						onSubmitAnswer={submitAnswer}
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
	{/if}
</div>

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
	.wbd-invite-page__mobile {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.wbd-invite-page__mobile-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.wbd-invite-page__mobile-header p,
	.wbd-invite-page__mobile-header h1 {
		margin: 0;
	}
	.wbd-invite-page__mobile-header p {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-invite-page__mobile-header h1 {
		font-size: 1.375rem;
		line-height: 1.2;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-invite-page__mobile-header span,
	.wbd-invite-page__mobile-header details {
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-invite-page__mobile-header summary {
		font-weight: 700;
		cursor: pointer;
	}
	.wbd-invite-page__mobile-header details div {
		margin-top: 0.375rem;
	}
	.wbd-invite-page__mobile-nav {
		position: sticky;
		top: 0;
		z-index: 2;
		margin: 0 -1rem;
		padding: 0.75rem 1rem 0.875rem;
		border-block: 1px solid var(--color-border-primary, #cbd5e1);
		background: color-mix(in srgb, var(--color-background-primary, #ffffff) 94%, transparent);
		backdrop-filter: blur(12px);
	}
	.wbd-invite-page__mobile-nav-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.625rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-invite-page__mobile-question-strip {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(5.5rem, 38vw);
		gap: 0.5rem;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scrollbar-width: thin;
	}
	.wbd-invite-page__mobile-question-strip button {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr);
		align-items: center;
		gap: 0.5rem;
		min-height: 3rem;
		padding: 0.5rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-primary, #fff);
		text-align: left;
		cursor: pointer;
	}
	.wbd-invite-page__mobile-question-strip button span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 999px;
		background: var(--color-background-secondary, #f1f5f9);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-invite-page__mobile-question-strip button strong {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 0.75rem;
		line-height: 1.25;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-invite-page__mobile-question--active {
		border-color: var(--color-primary-500, #3b82f6) !important;
	}
	.wbd-invite-page__mobile-question--done span {
		background: var(--color-success-100, #dcfce7) !important;
		color: var(--color-success-700, #15803d) !important;
	}
	@media (max-width: 760px) {
		.wbd-invite-page {
			padding: 1rem 1rem 3rem;
			gap: 1rem;
		}
		.wbd-invite-page__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
