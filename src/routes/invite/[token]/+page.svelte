<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import { page } from '$app/state';
	import ExpertInviteLanding from '$stylist/wbd/component/organism/expert-invite-landing/index.svelte';
	import ExpertSessionBriefing from '$stylist/wbd/component/organism/expert-session-briefing/index.svelte';
	import WbdQuestionnairePage from '$stylist/wbd/component/template/wbd-questionnaire-page/index.svelte';
	import type { StructWbdExpertAnswer } from '$stylist/wbd/type/object/expert-answer';
	import { t } from '$lib/i18n/function/translate';

	let { data } = $props();

	const acceptedKey = `wbd-invite-accepted-${data.token}`;
	let accepted = $state(browser ? localStorage.getItem(acceptedKey) === '1' : false);
	let declined = $state(false);

	const answers = $derived(Object.fromEntries(data.answers.map((a) => [a.questionId, a])));

	function navigateTo(params: Record<string, string>) {
		const url = new URL(page.url);
		for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
		void goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}

	function selectQuestion(questionId: string) {
		navigateTo({ question: questionId });
	}

	function selectDiscussionRound(roundNumber: number) {
		navigateTo({ round: String(roundNumber) });
	}

	async function submitAnswer(answer: StructWbdExpertAnswer) {
		const formData = new FormData();
		formData.set('questionId', answer.questionId);
		formData.set('roundNumber', String(data.session.currentRound));
		if (answer.optimistic !== undefined) formData.set('optimistic', String(answer.optimistic));
		if (answer.realistic !== undefined) formData.set('realistic', String(answer.realistic));
		if (answer.pessimistic !== undefined) formData.set('pessimistic', String(answer.pessimistic));
		if (answer.rationale !== undefined) formData.set('rationale', answer.rationale);
		if (answer.confidence !== undefined) formData.set('confidence', String(answer.confidence));

		const response = await fetch('?/submitAnswer', { method: 'POST', body: formData });
		const result = deserialize(await response.text());
		if (result.type === 'success') await invalidateAll();
	}

	async function submitMessage(message: string, parentId?: string) {
		const formData = new FormData();
		formData.set('questionId', data.currentQuestionId);
		formData.set('roundNumber', String(data.discussionRound));
		formData.set('message', message);
		if (parentId) formData.set('parentId', parentId);

		const response = await fetch('?/submitMessage', { method: 'POST', body: formData });
		const result = deserialize(await response.text());
		if (result.type === 'success') await invalidateAll();
	}
</script>

<svelte:head>
	<title>{data.session.title} — WeOracle</title>
</svelte:head>

<div class="wbd-invite-page">
	{#if declined}
		<p class="wbd-invite-page__note">{t('invite.declined')}</p>
	{:else if data.session.status === 'draft'}
		<ExpertSessionBriefing
			sessionTitle={data.session.title}
			description={data.session.description ?? undefined}
			assumptions={data.session.assumptions ?? undefined}
			currentRound={data.session.currentRound}
			maxRounds={data.session.maxRounds}
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
		<WbdQuestionnairePage
			session={data.session}
			questions={data.questions}
			{answers}
			currentQuestionId={data.currentQuestionId}
			discussionMessages={data.discussionMessages}
			discussionRound={data.discussionRound}
			onSelectQuestion={selectQuestion}
			onSelectDiscussionRound={selectDiscussionRound}
			onSubmitAnswer={submitAnswer}
			onSubmitMessage={submitMessage}
		/>
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
</style>
