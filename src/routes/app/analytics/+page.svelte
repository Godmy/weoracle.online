<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props();
	const analytics = $derived(data.analytics);
</script>

<svelte:head>
	<title>Analytics - WeOracle</title>
</svelte:head>

<section class="page">
	<div class="metrics">
		<article><span>{t('analytics.metrics.sessions')}</span><strong>{analytics.totalSessions}</strong></article>
		<article><span>{t('analytics.metrics.active')}</span><strong>{analytics.activeSessions}</strong></article>
		<article><span>{t('analytics.metrics.completed')}</span><strong>{analytics.completedSessions}</strong></article>
		<article><span>{t('analytics.metrics.questions')}</span><strong>{analytics.totalQuestions}</strong></article>
		<article><span>{t('analytics.metrics.answers')}</span><strong>{analytics.totalAnswers}</strong></article>
		<article><span>{t('analytics.metrics.discussions')}</span><strong>{analytics.totalDiscussions}</strong></article>
	</div>

	<div class="grid">
		<section class="panel">
			<h2>{t('analytics.statusDistribution')}</h2>
			{#each analytics.statusCounts as item (item.status)}
				<div class="row"><span>{item.status}</span><strong>{item.count}</strong></div>
			{:else}
				<p>{t('analytics.noSessions')}</p>
			{/each}
		</section>
		<section class="panel">
			<h2>{t('analytics.consensus')}</h2>
			<div class="row"><span>{t('analytics.high')}</span><strong>{analytics.highConsensus}</strong></div>
			<div class="row"><span>{t('analytics.medium')}</span><strong>{analytics.mediumConsensus}</strong></div>
			<div class="row"><span>{t('analytics.low')}</span><strong>{analytics.lowConsensus}</strong></div>
			<div class="row"><span>{t('analytics.avgConfidence')}</span><strong>{analytics.averageConfidence ? analytics.averageConfidence.toFixed(1) : '-'}</strong></div>
		</section>
	</div>
</section>

<style>
	.page { display: grid; gap: 1.25rem; }
	h2 { margin: 0; }
	h2 { font-size: 1rem; }
	.metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
	.metrics article, .panel { border: 1px solid var(--color-border-primary, #e2e8f0); border-radius: 0.5rem; background: var(--color-background-secondary, #f8fafc); }
	.metrics article, .panel { padding: 1rem; }
	.metrics span, .row span, p { color: var(--color-text-secondary, #64748b); font-size: 0.8125rem; }
	.metrics strong { display: block; margin-top: 0.375rem; font-size: 1.5rem; }
	.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
	.panel { display: grid; gap: 0.75rem; }
	.row { display: flex; justify-content: space-between; gap: 1rem; padding-top: 0.625rem; border-top: 1px solid var(--color-border-primary, #e2e8f0); }
	@media (max-width: 760px) { .metrics, .grid { grid-template-columns: 1fr; } }
</style>
