<script lang="ts">
	import { ExpertQuestionNavigator, ExpertQuestionnaire, ExpertSessionBriefing, QuestionDiscussionPanel } from 'stylist-svelte';
	import { toStructAnswer, toStructDiscussionMessage, toStructQuestion } from '$lib/wbd/map';
	import type { WbdAnswerRow, WbdDiscussionMessageRow, WbdQuestionRow, WbdSessionRow } from '$lib/wbd/types';
	import { t } from '$lib/i18n';

	let {
		session,
		questions: questionRows,
		answers: initialAnswers,
		token
	}: {
		session: WbdSessionRow;
		questions: WbdQuestionRow[];
		answers: WbdAnswerRow[];
		token: string;
	} = $props();

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

	const questions = $derived(questionRows.map(toStructQuestion));
	let answers = $state(Object.fromEntries(initialAnswers.map((a) => [a.question_id, toStructAnswer(a)])));

	let currentQuestionId = $state(questionRows[0]?.id ?? '');
	const currentQuestion = $derived(questions.find((question) => question.id === currentQuestionId) ?? questions[0]);
	const submittedCount = $derived(questions.filter((question) => answers[question.id]?.submitted).length);

	async function submitAnswer(answer: { questionId: string }) {
		const res = await fetch(`/api/wbd/questions/${answer.questionId}/answers`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				round_number: session.current_round,
				expert_token: token,
				...answer
			})
		});
		if (res.ok) {
			const row = await res.json();
			answers = { ...answers, [answer.questionId]: toStructAnswer(row) };
		}
	}

	let discussionRounds = $derived(Array.from({ length: session.current_round }, (_, i) => i + 1));
	let discussionMessages = $state<WbdDiscussionMessageRow[]>([]);
	let discussionRound = $state(session.current_round);

	async function loadDiscussion() {
		if (!currentQuestionId) return;
		const res = await fetch(
			`/api/wbd/questions/${currentQuestionId}/discussion?round=${discussionRound}&expert_token=${token}`
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
			body: JSON.stringify({ round_number: discussionRound, expert_token: token, message, parentId })
		});
		await loadDiscussion();
	}
</script>

{#if isMobileLayout}
	<div class="wbd-round-experience__mobile">
		<header class="wbd-round-experience__mobile-header">
			<p>{t('invite.roundOf', { round: session.current_round, max: session.max_rounds })}</p>
			<h1>{session.title}</h1>
			{#if session.description}
				<span>{session.description}</span>
			{/if}
			{#if session.assumptions}
				<details>
					<summary>{t('invite.assumptions')}</summary>
					<div>{session.assumptions}</div>
				</details>
			{/if}
		</header>

		<section class="wbd-round-experience__mobile-nav" aria-label={t('invite.questionsNav')}>
			<div class="wbd-round-experience__mobile-nav-header">
				<span>{t('invite.questionOf', { n: currentQuestion ? currentQuestion.orderIndex + 1 : 0, total: questions.length })}</span>
				<span>{t('invite.submittedOf', { submitted: submittedCount, total: questions.length })}</span>
			</div>
			<div class="wbd-round-experience__mobile-question-strip">
				{#each questions as question (question.id)}
					<button
						type="button"
						class:wbd-round-experience__mobile-question--active={question.id === currentQuestionId}
						class:wbd-round-experience__mobile-question--done={answers[question.id]?.submitted}
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

		<ExpertQuestionnaire {questions} {answers} {currentQuestionId} onSubmitAnswer={submitAnswer} />

		{#if currentQuestionId}
			{@const question = questions.find((q) => q.id === currentQuestionId)}
			{#if question}
				<QuestionDiscussionPanel
					{question}
					messages={discussionMessages.map((m) => toStructDiscussionMessage(m, token))}
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
		sessionTitle={session.title}
		description={session.description ?? undefined}
		assumptions={session.assumptions ?? undefined}
		currentRound={session.current_round}
		maxRounds={session.max_rounds}
		questionCount={questionRows.length}
	/>
	<div class="wbd-round-experience__grid">
		<aside>
			<ExpertQuestionNavigator {questions} {answers} {currentQuestionId} onSelectQuestion={(id) => (currentQuestionId = id)} />
		</aside>
		<main>
			<ExpertQuestionnaire {questions} {answers} {currentQuestionId} onSubmitAnswer={submitAnswer} />

			{#if currentQuestionId}
				{@const question = questions.find((q) => q.id === currentQuestionId)}
				{#if question}
					<QuestionDiscussionPanel
						{question}
						messages={discussionMessages.map((m) => toStructDiscussionMessage(m, token))}
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

<style>
	.wbd-round-experience__grid {
		display: grid;
		grid-template-columns: minmax(14rem, 18rem) 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	.wbd-round-experience__grid main {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.wbd-round-experience__mobile {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.wbd-round-experience__mobile-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.wbd-round-experience__mobile-header p,
	.wbd-round-experience__mobile-header h1 {
		margin: 0;
	}
	.wbd-round-experience__mobile-header p {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-round-experience__mobile-header h1 {
		font-size: 1.375rem;
		line-height: 1.2;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-round-experience__mobile-header span,
	.wbd-round-experience__mobile-header details {
		font-size: 0.875rem;
		line-height: 1.45;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-round-experience__mobile-header summary {
		font-weight: 700;
		cursor: pointer;
	}
	.wbd-round-experience__mobile-header details div {
		margin-top: 0.375rem;
	}
	.wbd-round-experience__mobile-nav {
		position: sticky;
		top: 0;
		z-index: 2;
		margin: 0 -1rem;
		padding: 0.75rem 1rem 0.875rem;
		border-block: 1px solid var(--color-border-primary, #cbd5e1);
		background: color-mix(in srgb, var(--color-background-primary, #ffffff) 94%, transparent);
		backdrop-filter: blur(12px);
	}
	.wbd-round-experience__mobile-nav-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.625rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-round-experience__mobile-question-strip {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(5.5rem, 38vw);
		gap: 0.5rem;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scrollbar-width: thin;
	}
	.wbd-round-experience__mobile-question-strip button {
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
	.wbd-round-experience__mobile-question-strip button span {
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
	.wbd-round-experience__mobile-question-strip button strong {
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 0.75rem;
		line-height: 1.25;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-round-experience__mobile-question--active {
		border-color: var(--color-primary-500, #3b82f6) !important;
	}
	.wbd-round-experience__mobile-question--done span {
		background: var(--color-success-100, #dcfce7) !important;
		color: var(--color-success-700, #15803d) !important;
	}
	@media (max-width: 760px) {
		.wbd-round-experience__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
