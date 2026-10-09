<script lang="ts">
	import { t } from '$lib/i18n/function/translate';
	import ReportOverviewPage from '$stylist/wbd/component/template/report-overview-page/index.svelte';
	import type { StructWbdReportOverviewRow } from '$stylist/wbd/type/object/report-overview-row';
	import type { StructWbdReportCandidateRow } from '$stylist/wbd/type/object/report-candidate-row';

	let { data } = $props();

	const reports = $derived(
		data.reports.map(
			(report): StructWbdReportOverviewRow => ({
				id: report.id,
				sessionId: report.session_id,
				sessionTitle: report.session_title,
				title: report.title,
				status: report.status,
				format: report.format,
				createdAt: report.created_at,
				publishedAt: report.published_at
			})
		)
	);

	const candidates = $derived(
		data.candidates.map(
			(candidate): StructWbdReportCandidateRow => ({
				id: candidate.id,
				title: candidate.title,
				status: candidate.status,
				completedAt: candidate.completed_at,
				questionCount: candidate.question_count,
				responseCount: candidate.response_count
			})
		)
	);
</script>

<svelte:head>
	<title>Reports - WeOracle</title>
</svelte:head>

<ReportOverviewPage
	{reports}
	{candidates}
	reportsHeading={t('reports.generated')}
	candidatesHeading={t('reports.candidates')}
	emptyReportsLabel={t('reports.emptyReports')}
	emptyCandidatesLabel={t('reports.emptyCandidates')}
/>
