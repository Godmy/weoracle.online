<script lang="ts">
	import { t } from '$lib/i18n/function/translate';
	import EstimateOverviewPage from '$stylist/wbd/component/template/estimate-overview-page/index.svelte';
	import type { StructWbdEstimateOverviewRow } from '$stylist/wbd/type/object/estimate-overview-row';

	let { data } = $props();

	const rows = $derived(
		data.estimates.map(
			(estimate): StructWbdEstimateOverviewRow => ({
				id: estimate.id,
				sessionId: estimate.session_id,
				sessionTitle: estimate.session_title,
				questionText: estimate.question_text,
				roundNumber: estimate.round_number,
				expertAlias: estimate.expert_alias,
				expertName: estimate.expert_name,
				optimistic: estimate.optimistic,
				realistic: estimate.realistic,
				pessimistic: estimate.pessimistic,
				confidence: estimate.confidence,
				submittedAt: estimate.submitted_at
			})
		)
	);
</script>

<svelte:head>
	<title>Estimates - WeOracle</title>
</svelte:head>

<EstimateOverviewPage
	{rows}
	totalLabel={t('estimates.metrics.total')}
	submittedLabel={t('estimates.metrics.submitted')}
	averageConfidenceLabel={t('estimates.metrics.avgConfidence')}
	emptyLabel={t('estimates.empty')}
/>
