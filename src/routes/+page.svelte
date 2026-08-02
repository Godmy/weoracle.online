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
			<a class="home__brand" href="/">WeOracle</a>
			<div>
				<a href="/app/sign-in">Sign in</a>
				<a href="/app">Sessions</a>
			</div>
		</nav>

		<div class="home__content">
			<div class="home__copy">
				<span>Wideband Delphi</span>
				<h1>Anonymous expert consensus for decisions that need judgment.</h1>
				<p>
					Create a session, invite experts, collect three-point estimates, discuss disagreements by alias,
					and publish round-by-round consensus results.
				</p>
				<div class="home__actions">
					<a class="home__primary" href="/app">Open sessions</a>
					<a href="/app/new">Create session</a>
				</div>
			</div>

			<div class="home__panel" aria-label="Wideband Delphi flow">
				<div>
					<strong>01</strong>
					<span>Define questions</span>
				</div>
				<div>
					<strong>02</strong>
					<span>Invite experts</span>
				</div>
				<div>
					<strong>03</strong>
					<span>Collect anonymous estimates</span>
				</div>
				<div>
					<strong>04</strong>
					<span>Review consensus</span>
				</div>
			</div>
		</div>
	</section>

	<section class="home__metrics">
		<article>
			<strong>Roles</strong>
			<span>coordinator, expert, admin</span>
		</article>
		<article>
			<strong>Rounds</strong>
			<span>draft, active, snapshots, final report</span>
		</article>
		<article>
			<strong>Privacy</strong>
			<span>expert aliases stay separate from identity</span>
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
	.home__brand,
	.home__nav a,
	.home__actions a {
		font-weight: 700;
		text-decoration: none;
		color: inherit;
	}
	.home__nav div {
		display: flex;
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
	.home__copy > span {
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		color: var(--color-primary-700, #1d4ed8);
	}
	.home__copy h1 {
		margin: 0;
		font-size: clamp(2rem, 5vw, 4.5rem);
		line-height: 1;
		letter-spacing: 0;
	}
	.home__copy p {
		margin: 0;
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
	.home__actions a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: 0 1rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}
	.home__actions .home__primary {
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
	.home__panel strong,
	.home__metrics strong {
		font-size: 0.75rem;
		color: var(--color-primary-700, #1d4ed8);
	}
	.home__panel span,
	.home__metrics span {
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
