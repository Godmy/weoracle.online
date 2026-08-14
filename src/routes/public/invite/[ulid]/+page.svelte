<script lang="ts">
	import { ExpertSessionBriefing } from 'stylist-svelte';
	import type { ActionData, PageData } from './$types';
	import { t } from '$lib/i18n';

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

	{#if data.session.status === 'draft'}
		<p class="wbd-public-invite__note">{t('invite.waiting')}</p>
	{:else if form?.sent}
		<div class="wbd-public-invite__form">
			<h2>{t('signIn.check.title')}</h2>
			<p>{checkEmailParts[0]}<strong>{form.email}</strong>{checkEmailParts[1]}</p>
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
		max-width: 32rem;
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
</style>
