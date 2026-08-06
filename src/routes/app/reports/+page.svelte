<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props();
</script>

<svelte:head>
	<title>Reports - WeOracle</title>
</svelte:head>

<section class="page">
	<section class="panel">
		<h2>{t('reports.generated')}</h2>
		<table>
			<thead>
				<tr><th>{t('reports.table.report')}</th><th>{t('reports.table.session')}</th><th>{t('reports.table.status')}</th><th>{t('reports.table.format')}</th><th>{t('reports.table.created')}</th></tr>
			</thead>
			<tbody>
				{#each data.reports as report (report.id)}
					<tr>
						<td>{report.title}</td>
						<td><a href={`/app/${report.session_id}`}>{report.session_title}</a></td>
						<td>{report.status}</td>
						<td>{report.format}</td>
						<td>{report.created_at}</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="empty">{t('reports.emptyReports')}</td></tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="panel">
		<h2>{t('reports.candidates')}</h2>
		<table>
			<thead>
				<tr><th>{t('reports.table.session')}</th><th>{t('reports.table.status')}</th><th>{t('reports.table.questions')}</th><th>{t('reports.table.responses')}</th><th>{t('reports.table.completed')}</th></tr>
			</thead>
			<tbody>
				{#each data.candidates as session (session.id)}
					<tr>
						<td><a href={`/app/${session.id}`}>{session.title}</a></td>
						<td>{session.status}</td>
						<td>{session.question_count}</td>
						<td>{session.response_count}</td>
						<td>{session.completed_at ?? '-'}</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="empty">{t('reports.emptyCandidates')}</td></tr>
				{/each}
			</tbody>
		</table>
	</section>
</section>

<style>
	.page { display: grid; gap: 1.25rem; }
	h2 { margin: 0; }
	h2 { font-size: 1rem; }
	.panel { overflow-x: auto; border: 1px solid var(--color-border-primary, #e2e8f0); border-radius: 0.5rem; background: var(--color-background-secondary, #f8fafc); padding: 1rem; }
	table { width: 100%; margin-top: 0.75rem; border-collapse: collapse; font-size: 0.875rem; }
	th, td { padding: 0.75rem; border-bottom: 1px solid var(--color-border-primary, #e2e8f0); text-align: left; }
	th { color: var(--color-text-secondary, #64748b); font-size: 0.75rem; text-transform: uppercase; }
	a { color: var(--color-text-primary, #0f172a); font-weight: 700; text-decoration: none; }
	.empty { color: var(--color-text-secondary, #64748b); text-align: center; }
</style>
