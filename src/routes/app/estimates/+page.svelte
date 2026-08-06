<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props();

	const submitted = $derived(data.estimates.filter((estimate) => estimate.submitted_at).length);
	const averageConfidence = $derived.by(() => {
		const values = data.estimates
			.map((estimate) => estimate.confidence)
			.filter((value): value is number => typeof value === 'number');
		if (values.length === 0) return null;
		return values.reduce((sum, value) => sum + value, 0) / values.length;
	});
</script>

<svelte:head>
	<title>Estimates - WeOracle</title>
</svelte:head>

<section class="page">
	<div class="metrics">
		<article><span>{t('estimates.metrics.total')}</span><strong>{data.estimates.length}</strong></article>
		<article><span>{t('estimates.metrics.submitted')}</span><strong>{submitted}</strong></article>
		<article><span>{t('estimates.metrics.avgConfidence')}</span><strong>{averageConfidence ? averageConfidence.toFixed(1) : '-'}</strong></article>
	</div>

	<div class="table-shell">
		<table>
			<thead>
				<tr>
					<th>{t('estimates.table.question')}</th>
					<th>{t('estimates.table.session')}</th>
					<th>{t('estimates.table.expert')}</th>
					<th>{t('estimates.table.round')}</th>
					<th>{t('estimates.table.omp')}</th>
					<th>{t('estimates.table.confidence')}</th>
				</tr>
			</thead>
			<tbody>
				{#each data.estimates as estimate (estimate.id)}
					<tr>
						<td><a href={`/app/${estimate.session_id}/round?round=${estimate.round_number}`}>{estimate.question_text}</a></td>
						<td>{estimate.session_title}</td>
						<td>{estimate.expert_alias} <small>{estimate.expert_name}</small></td>
						<td>{estimate.round_number}</td>
						<td>{estimate.optimistic ?? '-'} / {estimate.realistic ?? '-'} / {estimate.pessimistic ?? '-'}</td>
						<td>{estimate.confidence ?? '-'}</td>
					</tr>
				{:else}
					<tr><td colspan="6" class="empty">{t('estimates.empty')}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.page { display: grid; gap: 1.25rem; }
	.metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
	.metrics article, .table-shell { border: 1px solid var(--color-border-primary, #e2e8f0); border-radius: 0.5rem; background: var(--color-background-secondary, #f8fafc); }
	.metrics article { padding: 1rem; }
	.metrics span, small { display: block; color: var(--color-text-secondary, #64748b); font-size: 0.8125rem; }
	.metrics strong { display: block; margin-top: 0.375rem; font-size: 1.5rem; }
	.table-shell { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
	th, td { padding: 0.75rem; border-bottom: 1px solid var(--color-border-primary, #e2e8f0); text-align: left; vertical-align: top; }
	th { color: var(--color-text-secondary, #64748b); font-size: 0.75rem; text-transform: uppercase; }
	td a { color: var(--color-text-primary, #0f172a); font-weight: 700; text-decoration: none; }
	.empty { color: var(--color-text-secondary, #64748b); text-align: center; }
	@media (max-width: 760px) { .metrics { grid-template-columns: 1fr; } }
</style>
