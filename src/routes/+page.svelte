<script lang="ts">
	import { Badge, Button } from 'stylist-svelte';
</script>

<svelte:head>
	<title>WeOracle</title>
	<meta name="description" content="WeOracle" />
</svelte:head>

<main class="page">
	<section class="hero">
		<Badge>Powered by stylist-svelte</Badge>
		<h1>WeOracle</h1>
		<p>SvelteKit on Cloudflare Workers, wired up with the stylist-svelte component library.</p>
		<div class="actions">
			<Button variant="primary" size="lg">Get started</Button>
			<Button variant="outline" size="lg">Learn more</Button>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}
	.hero {
		max-width: 40rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	h1 {
		font-size: clamp(2.5rem, 6vw, 4rem);
		margin: 0;
	}
	p {
		margin: 0;
		color: var(--color-text-muted, #475569);
	}
	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>
