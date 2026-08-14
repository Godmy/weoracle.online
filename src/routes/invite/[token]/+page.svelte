<script lang="ts">
	import { browser } from '$app/environment';
	import { ExpertInviteLanding, ExpertSessionBriefing } from 'stylist-svelte';
	import ExpertRoundExperience from '$lib/wbd/expert-round-experience.svelte';
	import { t } from '$lib/i18n';

	let { data } = $props();

	const acceptedKey = `wbd-invite-accepted-${data.token}`;
	let accepted = $state(browser ? localStorage.getItem(acceptedKey) === '1' : false);
	let declined = $state(false);
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
		<ExpertRoundExperience session={data.session} questions={data.questions} answers={data.answers} token={data.token} />
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
