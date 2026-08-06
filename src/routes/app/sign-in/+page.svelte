<script lang="ts">
	import type { ActionData } from './$types';
	import { t } from '$lib/i18n';
	let { form }: { form: ActionData } = $props();

	// Split around the placeholder ourselves so `form.email` stays plain-text-interpolated
	// (Svelte-escaped) instead of going through `{@html}` with attacker-controllable input.
	const checkEmailParts = $derived(t('signIn.check.body').split('{email}'));
</script>

<svelte:head>
	<title>Sign in — WeOracle</title>
</svelte:head>

<div class="wbd-sign-in">
	{#if form?.sent}
		<div class="wbd-sign-in__form">
			<h1>{t('signIn.check.title')}</h1>
			<p>{checkEmailParts[0]}<strong>{form.email}</strong>{checkEmailParts[1]}</p>
		</div>
	{:else}
		<form method="POST" action="?/requestLink" class="wbd-sign-in__form">
			<h1>{t('signIn.form.title')}</h1>
			<p>{t('signIn.form.lead')}</p>
			{#if form?.message}
				<p class="wbd-sign-in__error">{form.message}</p>
			{/if}
			<label>
				<span>{t('signIn.form.nameLabel')}</span>
				<input name="name" type="text" required autocomplete="name" />
			</label>
			<label>
				<span>{t('signIn.form.emailLabel')}</span>
				<input name="email" type="email" required autocomplete="email" />
			</label>
			<button type="submit">{t('signIn.form.submit')}</button>
		</form>
		<form method="POST" action="?/adminSignIn" class="wbd-sign-in__form wbd-sign-in__form--admin">
			<h2>{t('signIn.admin.title')}</h2>
			<p>{t('signIn.admin.lead')}</p>
			{#if form?.message}
				<p class="wbd-sign-in__error">{form.message}</p>
			{/if}
			<label>
				<span>{t('signIn.admin.emailLabel')}</span>
				<input name="email" type="email" required autocomplete="username" />
			</label>
			<label>
				<span>{t('signIn.admin.passwordLabel')}</span>
				<input name="password" type="password" required autocomplete="current-password" />
			</label>
			<button type="submit">{t('signIn.admin.submit')}</button>
		</form>
	{/if}
</div>

<style>
	.wbd-sign-in {
		min-height: 100vh;
		display: grid;
		align-items: center;
		justify-content: center;
		grid-template-columns: repeat(2, minmax(0, 22rem));
		gap: 1rem;
		padding: 2rem;
	}
	.wbd-sign-in__form {
		width: 100%;
		max-width: 22rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 2rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.75rem;
		background: var(--color-background-primary, #fff);
	}
	.wbd-sign-in__form--admin {
		background: var(--color-background-secondary, #f8fafc);
	}
	.wbd-sign-in__form h1,
	.wbd-sign-in__form h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-sign-in__form h2 {
		font-size: 1.125rem;
	}
	.wbd-sign-in__form p {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text-tertiary, #64748b);
	}
	.wbd-sign-in__error {
		color: var(--color-danger-600, #dc2626);
	}
	.wbd-sign-in__form label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-sign-in__form input {
		box-sizing: border-box;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font: inherit;
	}
	.wbd-sign-in__form button {
		margin-top: 0.5rem;
		padding: 0.625rem;
		border: none;
		border-radius: 0.375rem;
		background: var(--color-primary-500, #3b82f6);
		color: #fff;
		font-weight: 600;
		cursor: pointer;
	}
	@media (max-width: 760px) {
		.wbd-sign-in {
			grid-template-columns: 1fr;
		}
	}
</style>
