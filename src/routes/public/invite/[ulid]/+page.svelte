<script lang="ts">
	import ExpertSessionBriefing from '$stylist/wbd/component/organism/expert-session-briefing/index.svelte';
	import WidebandDelphiDiagram from '$stylist/chart/component/organism/wideband-delphi-diagram/index.svelte';
	import type { ActionData, PageData } from './$types';
	import { t } from '$lib/i18n/function/translate';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Split around the placeholder ourselves so `form.email` stays plain-text-interpolated
	// (Svelte-escaped) instead of going through `{@html}` with attacker-controllable input.
	const checkEmailParts = $derived(t('signIn.check.body').split('{email}'));
</script>

<svelte:head>
	<title>{data.session.title} — WeOracle</title>
</svelte:head>

<div class="wbd-public-invite">
	<img
		class="wbd-public-invite__image"
		src={data.session.image_url ?? '/gen/process-wideband-delphi-flow.png'}
		alt={data.session.title}
	/>

	<ExpertSessionBriefing
		sessionTitle={data.session.title}
		description={data.session.description ?? undefined}
		assumptions={data.session.assumptions ?? undefined}
		currentRound={data.session.current_round}
		maxRounds={data.session.max_rounds}
		questionCount={data.session.question_count}
	/>

	{#if data.preview}
		<section class="wbd-public-invite__preview" aria-label="Previous round results">
			<div class="wbd-public-invite__preview-copy">
				<h2>Previous round results</h2>
				<p>{data.preview.summary}</p>
			</div>

			<div class="wbd-public-invite__diagram">
				<WidebandDelphiDiagram
					text={data.preview.chartTitle}
					description={data.preview.chartDescription}
					points={data.preview.chartPoints}
					currency={data.preview.chartCurrency}
					timeLabelStep={1}
				/>
			</div>

			<div class="wbd-public-invite__scores">
				<h3>Expert estimates</h3>
				{#each data.preview.questions as question (question.id)}
					<article class="wbd-public-invite__question">
						<header>
							<strong>{question.title}</strong>
							<span>{question.unit}</span>
						</header>
						<div class="wbd-public-invite__score-table" role="table" aria-label={question.title}>
							<div class="wbd-public-invite__score-row wbd-public-invite__score-row--head" role="row">
								<span role="columnheader">Round</span>
								<span role="columnheader">Optimistic</span>
								<span role="columnheader">Realistic</span>
								<span role="columnheader">Pessimistic</span>
								<span role="columnheader">Confidence</span>
							</div>
							{#each question.rounds as round (`${question.id}-${round.round}`)}
								<div class="wbd-public-invite__score-row" role="row">
									<span role="cell">R{round.round}</span>
									<span role="cell">{round.optimistic}</span>
									<span role="cell">{round.realistic}</span>
									<span role="cell">{round.pessimistic}</span>
									<span role="cell">{round.confidence}/5</span>
								</div>
							{/each}
						</div>
					</article>
				{/each}
			</div>

			<div class="wbd-public-invite__discussions">
				<h3>Previous discussions</h3>
				{#each data.preview.discussions as discussion (discussion.id)}
					<article class="wbd-public-invite__discussion">
						<header>
							<strong>{discussion.alias}</strong>
							<span>R{discussion.roundNumber}</span>
							<time>{discussion.createdAt}</time>
						</header>
						<p class="wbd-public-invite__discussion-question">{discussion.questionTitle}</p>
						<p>{discussion.message}</p>
					</article>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.session.status === 'draft'}
		<p class="wbd-public-invite__note">{t('invite.waiting')}</p>
	{:else if form?.sent}
		<div class="wbd-public-invite__form">
			<h2>{t('signIn.check.title')}</h2>
			<p>{checkEmailParts[0]}<strong>{form.email}</strong>{checkEmailParts[1]}</p>
			{#if form.devPreview}
				<p class="wbd-public-invite__note">
					Dev preview mode: the form was accepted without sending email.
				</p>
			{/if}
		</div>
	{:else}
		<form method="POST" action="?/join" class="wbd-public-invite__form">
			<h2>{t('publicInvite.title')}</h2>
			<p>{t('publicInvite.lead')}</p>
			{#if form?.message}
				<p class="wbd-public-invite__error">{form.message}</p>
			{/if}
			<label>
				<span>{t('publicInvite.nameLabel')}</span>
				<input name="name" type="text" required autocomplete="name" />
			</label>
			<label>
				<span>{t('publicInvite.emailLabel')}</span>
				<input name="email" type="email" required autocomplete="email" />
			</label>
			<button type="submit">{t('publicInvite.submit')}</button>
		</form>
	{/if}
</div>

<style>
	.wbd-public-invite {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.wbd-public-invite__image {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border-radius: 0.75rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
	}
	.wbd-public-invite__preview {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-primary, #fff);
	}
	.wbd-public-invite__preview-copy {
		display: grid;
		gap: 0.375rem;
	}
	.wbd-public-invite__preview h2,
	.wbd-public-invite__preview h3,
	.wbd-public-invite__preview p {
		margin: 0;
	}
	.wbd-public-invite__preview h2 {
		font-size: 1.25rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-public-invite__preview h3 {
		font-size: 0.95rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-public-invite__preview p {
		font-size: 0.875rem;
		line-height: 1.55;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-public-invite__diagram {
		min-width: 0;
		padding: 1rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f8fafc);
	}
	.wbd-public-invite__scores,
	.wbd-public-invite__discussions {
		display: grid;
		gap: 0.75rem;
	}
	.wbd-public-invite__question {
		display: grid;
		gap: 0.625rem;
		padding: 0.875rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
	}
	.wbd-public-invite__question header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-public-invite__question header span {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-public-invite__score-table {
		overflow-x: auto;
	}
	.wbd-public-invite__score-row {
		display: grid;
		grid-template-columns: repeat(5, minmax(6rem, 1fr));
		min-width: 34rem;
		border-top: 1px solid var(--color-border-primary, #e2e8f0);
	}
	.wbd-public-invite__score-row span {
		padding: 0.5rem;
		font-size: 0.8125rem;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-public-invite__score-row--head span {
		font-size: 0.72rem;
		font-weight: 800;
		text-transform: uppercase;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-public-invite__discussion {
		display: grid;
		gap: 0.375rem;
		padding: 0.875rem 0;
		border-top: 1px solid var(--color-border-primary, #e2e8f0);
	}
	.wbd-public-invite__discussion header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.wbd-public-invite__discussion header strong {
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-public-invite__discussion header span,
	.wbd-public-invite__discussion time,
	.wbd-public-invite__discussion-question {
		font-size: 0.75rem;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-public-invite__note {
		font-size: 0.875rem;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-public-invite__form {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 2rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.75rem;
		background: var(--color-background-primary, #fff);
	}
	.wbd-public-invite__form h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-public-invite__form p {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-public-invite__error {
		color: var(--color-danger-600, #dc2626);
	}
	.wbd-public-invite__form label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-public-invite__form input {
		box-sizing: border-box;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font: inherit;
	}
	.wbd-public-invite__form button {
		margin-top: 0.5rem;
		padding: 0.625rem;
		border: none;
		border-radius: 0.375rem;
		background: var(--color-primary-500, #3b82f6);
		color: #fff;
		font-weight: 600;
		cursor: pointer;
	}
	@media (max-width: 640px) {
		.wbd-public-invite {
			padding-inline: 1rem;
		}
		.wbd-public-invite__preview,
		.wbd-public-invite__form {
			padding: 1rem;
		}
		.wbd-public-invite__diagram {
			padding: 0.75rem;
		}
	}
</style>
