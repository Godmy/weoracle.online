<script lang="ts">
	import { Heading, Link, Text, ThemeModeToggle } from 'stylist-svelte';
</script>

<svelte:head>
	<title>WeOracle</title>
	<meta
		name="description"
		content="WeOracle runs anonymous Wideband Delphi sessions for expert forecasts, estimates, and consensus building."
	/>
</svelte:head>

<main class="home">
	<section class="home__hero">
		<nav class="home__nav" aria-label="Primary">
			<Link class="home__brand" href="/" tone="tertiary">WeOracle</Link>
			<div>
				<Link href="/app/sign-in" tone="tertiary">Sign in</Link>
				<Link href="/app" tone="tertiary">Sessions</Link>
				<ThemeModeToggle />
			</div>
		</nav>

		<div class="home__content">
			<div class="home__copy">
				<Text class="home__eyebrow" text="Wideband Delphi" />
				<Heading level={1} class="home__title">
					Anonymous expert consensus for decisions that need judgment.
				</Heading>
				<Text class="home__lead" block>
					Create a session, invite experts, collect three-point estimates, discuss disagreements by alias,
					and publish round-by-round consensus results.
				</Text>
				<div class="home__actions">
					<Link class="home__primary" href="/app">Open sessions</Link>
					<Link href="/app/new" tone="tertiary">Create session</Link>
				</div>
			</div>

			<div class="home__panel" aria-label="Wideband Delphi flow">
				<div>
					<Text class="home__step" text="01" />
					<Text text="Define questions" />
				</div>
				<div>
					<Text class="home__step" text="02" />
					<Text text="Invite experts" />
				</div>
				<div>
					<Text class="home__step" text="03" />
					<Text text="Collect anonymous estimates" />
				</div>
				<div>
					<Text class="home__step" text="04" />
					<Text text="Review consensus" />
				</div>
			</div>
		</div>
	</section>

	<section class="home__metrics">
		<article>
			<Text class="home__metric-title" text="Roles" />
			<Text text="coordinator, expert, admin" />
		</article>
		<article>
			<Text class="home__metric-title" text="Rounds" />
			<Text text="draft, active, snapshots, final report" />
		</article>
		<article>
			<Text class="home__metric-title" text="Privacy" />
			<Text text="expert aliases stay separate from identity" />
		</article>
	</section>
</main>

<style>
	.home {
		min-height: 100vh;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
	}
	.home__hero {
		display: flex;
		flex-direction: column;
		min-height: min(42rem, 100vh);
		padding: 1.25rem;
	}
	.home__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	:global(.home__brand),
	.home__actions :global(.c-typography-link) {
		font-weight: 700;
		text-decoration: none;
		color: inherit;
	}
	.home__nav div {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary, #475569);
	}
	.home__content {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
		gap: 2rem;
		align-items: center;
		max-width: 72rem;
		width: 100%;
		margin: 0 auto;
		padding: 3rem 0;
	}
	.home__copy {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 44rem;
	}
	:global(.home__eyebrow) {
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		color: var(--color-primary-700, #1d4ed8);
	}
	:global(.home__title) {
		font-size: clamp(2rem, 5vw, 4.5rem);
		line-height: 1;
		letter-spacing: 0;
	}
	:global(.home__lead) {
		max-width: 38rem;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--color-text-secondary, #475569);
	}
	.home__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
	.home__actions :global(.c-typography-link) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: 0 1rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}
	.home__actions :global(.home__primary) {
		border-color: var(--color-primary-500, #3b82f6);
		background: var(--color-primary-500, #3b82f6);
		color: var(--color-text-inverse, #fff);
	}
	.home__panel {
		display: grid;
		gap: 0.625rem;
		padding: 0.75rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f8fafc);
	}
	.home__panel div,
	.home__metrics article {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.875rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-primary, #fff);
	}
	:global(.home__step),
	:global(.home__metric-title) {
		font-size: 0.75rem;
		font-weight: 800;
		color: var(--color-primary-700, #1d4ed8);
	}
	.home__panel :global(.c-typography-text:not(.home__step)),
	.home__metrics :global(.c-typography-text:not(.home__metric-title)) {
		font-size: 0.875rem;
		color: var(--color-text-secondary, #475569);
	}
	.home__metrics {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1.25rem 2rem;
	}
	@media (max-width: 760px) {
		.home__content,
		.home__metrics {
			grid-template-columns: 1fr;
		}
		.home__hero {
			min-height: auto;
		}
	}
</style>
