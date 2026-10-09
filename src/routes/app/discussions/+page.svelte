<script lang="ts">
	import { t } from '$lib/i18n/function/translate';
	import DiscussionOverviewPage from '$stylist/wbd/component/template/discussion-overview-page/index.svelte';
	import type { StructWbdDiscussionOverviewRow } from '$stylist/wbd/type/object/discussion-overview-row';

	let { data } = $props();

	const discussions = $derived(
		data.discussions.map(
			(discussion): StructWbdDiscussionOverviewRow => ({
				id: discussion.id,
				sessionId: discussion.session_id,
				sessionTitle: discussion.session_title,
				questionText: discussion.question_text,
				roundNumber: discussion.round_number,
				alias: discussion.alias,
				message: discussion.message,
				createdAt: discussion.created_at
			})
		)
	);
</script>

<svelte:head>
	<title>Discussions - WeOracle</title>
</svelte:head>

<DiscussionOverviewPage {discussions} roundLabel={t('discussions.roundLabel')} emptyLabel={t('discussions.empty')} />
