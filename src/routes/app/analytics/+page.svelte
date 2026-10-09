<script lang="ts">
	import { t } from '$lib/i18n/function/translate';
	import AnalyticsOverviewPage from '$stylist/wbd/component/template/analytics-overview-page/index.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Analytics - WeOracle</title>
</svelte:head>

<AnalyticsOverviewPage
	analytics={data.analytics}
	sessionsLabel={t('analytics.metrics.sessions')}
	activeLabel={t('analytics.metrics.active')}
	completedLabel={t('analytics.metrics.completed')}
	questionsLabel={t('analytics.metrics.questions')}
	answersLabel={t('analytics.metrics.answers')}
	discussionsLabel={t('analytics.metrics.discussions')}
	statusHeading={t('analytics.statusDistribution')}
	emptyStatusLabel={t('analytics.noSessions')}
	consensusHeading={t('analytics.consensus')}
	highLabel={t('analytics.high')}
	mediumLabel={t('analytics.medium')}
	lowLabel={t('analytics.low')}
	averageConfidenceLabel={t('analytics.avgConfidence')}
/>
