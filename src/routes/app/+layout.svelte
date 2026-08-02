<script lang="ts">
	import { ThemeProvider } from 'stylist-svelte';

	let { data, children } = $props();
</script>

<ThemeProvider theme-mode="light">
	<div class="wbd-app">
		{#if data.user}
			<header class="wbd-app__bar">
				<a href="/app" class="wbd-app__brand">WeOracle</a>
				<div class="wbd-app__account">
					{#if data.user.role === 'admin'}
						<a href="/app/admin">Admin</a>
					{/if}
					<span>{data.user.name}</span>
					<form method="POST" action="/app/sign-in?/signOut">
						<button type="submit">Sign out</button>
					</form>
				</div>
			</header>
		{/if}
		<main class="wbd-app__main">
			{@render children()}
		</main>
	</div>
</ThemeProvider>

<style>
	.wbd-app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.wbd-app__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid var(--color-border-primary, #e2e8f0);
		background: var(--color-background-primary, #fff);
	}
	.wbd-app__brand {
		font-weight: 700;
		color: var(--color-text-primary, #0f172a);
		text-decoration: none;
	}
	.wbd-app__account {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8125rem;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-app__account button {
		padding: 0.375rem 0.625rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		font-size: 0.75rem;
		cursor: pointer;
	}
	.wbd-app__main {
		flex: 1;
		padding: 1.5rem;
		max-width: 72rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
