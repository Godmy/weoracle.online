<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign in — WeOracle</title>
</svelte:head>

<div class="wbd-sign-in">
	<form method="POST" action="?/signIn" class="wbd-sign-in__form">
		<h1>WeOracle</h1>
		<p>Sign in to run Wideband Delphi estimation sessions.</p>
		{#if form?.message}
			<p class="wbd-sign-in__error">{form.message}</p>
		{/if}
		<label>
			<span>Name</span>
			<input name="name" type="text" required autocomplete="name" />
		</label>
		<label>
			<span>Email</span>
			<input name="email" type="email" required autocomplete="email" />
		</label>
		<button type="submit">Continue</button>
	</form>
</div>

<style>
	.wbd-sign-in {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
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
	.wbd-sign-in__form h1 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--color-text-primary, #0f172a);
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
</style>
