<script lang="ts">
	import { goto } from '$app/navigation';
	import type { WbdSessionRow } from '$lib/wbd/types';

	let { data } = $props();

	function getSessionMeta(session: WbdSessionRow): string {
		return `Round ${session.current_round}/${session.max_rounds} · ${session.expert_count ?? 0} experts · ${session.question_count ?? 0} questions`;
	}
</script>

<svelte:head>
	<title>Sessions — WeOracle</title>
</svelte:head>

<section class="wbd-session-grid" aria-label="Sessions">
	{#each data.sessions as session (session.id)}
		<a class="wbd-session-card" href={`/app/${session.id}`}>
			<div class="wbd-session-card__media">
				{#if session.image_url}
					<img src={session.image_url} alt="" loading="lazy" />
				{/if}
			</div>
			<div class="wbd-session-card__body">
				<h2>{session.title}</h2>
				<p>{getSessionMeta(session)}</p>
				<div class="wbd-session-card__badges">
					<span>{session.status}</span>
					<span>{session.is_public ? 'Public poll' : 'Closed poll'}</span>
				</div>
			</div>
		</a>
	{:else}
		<div class="wbd-session-empty">
			No sessions yet.
			<button type="button" onclick={() => goto('/app/new')}>New session</button>
		</div>
	{/each}
</section>

<style>
	.wbd-session-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
	.wbd-session-card {
		display: flex;
		flex-direction: column;
		min-height: 16rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		overflow: hidden;
		text-decoration: none;
	}
	.wbd-session-card:hover {
		border-color: var(--color-primary-600, #2563eb);
	}
	.wbd-session-card__media {
		aspect-ratio: 16 / 9;
		background:
			linear-gradient(
				135deg,
				color-mix(in srgb, var(--color-background-secondary, #f8fafc) 78%, var(--color-primary-600, #2563eb) 22%),
				var(--color-background-secondary, #f8fafc)
			),
			var(--color-background-secondary, #f8fafc);
		border-bottom: 1px solid var(--color-border-primary, #e2e8f0);
	}
	.wbd-session-card__media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.wbd-session-card__body {
		display: grid;
		gap: 0.5rem;
		padding: 0.875rem;
	}
	.wbd-session-card__body h2 {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.3;
	}
	.wbd-session-card__body p {
		margin: 0;
		color: var(--color-text-tertiary, #64748b);
		font-size: 0.75rem;
		line-height: 1.4;
	}
	.wbd-session-card__badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}
	.wbd-session-card__badges span {
		justify-self: start;
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
		background: var(--color-background-secondary, #f1f5f9);
		color: var(--color-text-secondary, #475569);
		font-size: 0.6875rem;
		font-weight: 700;
	}
	.wbd-session-empty {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		min-height: 12rem;
		border: 1px dashed var(--color-border-primary, #cbd5e1);
		border-radius: 0.5rem;
		color: var(--color-text-secondary, #475569);
	}
	.wbd-session-empty button {
		min-height: 2.25rem;
		padding: 0 0.75rem;
		border: 1px solid var(--color-primary-600, #2563eb);
		border-radius: 0.375rem;
		background: var(--color-primary-600, #2563eb);
		color: var(--color-on-primary, #fff);
		font-weight: 700;
		cursor: pointer;
	}

	@media (max-width: 1100px) {
		.wbd-session-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 720px) {
		.wbd-session-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
