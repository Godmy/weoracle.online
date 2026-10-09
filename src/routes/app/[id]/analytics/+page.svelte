<script lang="ts">
	import { goto } from '$app/navigation';
	import MedianTrendChart from '$stylist/wbd/component/organism/median-trend-chart/index.svelte';
	import PermissionDeniedPanel from '$stylist/wbd/component/organism/permission-denied-panel/index.svelte';
	import QuestionConsensusMatrix from '$stylist/wbd/component/organism/question-consensus-matrix/index.svelte';
	import RoundComparisonPanel from '$stylist/wbd/component/organism/round-comparison-panel/index.svelte';

	let { data } = $props();

	const questionText = $derived(new Map(data.session.questions.map((q) => [q.id, q.text])));
	const rounds = $derived(
		[...new Set(data.snapshots.map((s) => s.roundNumber))].sort((a, b) => a - b)
	);

	const cells = $derived(
		data.snapshots
			.filter((s) => s.consensusLevel != null)
			.map((s) => ({
				questionId: s.questionId,
				questionText: questionText.get(s.questionId) ?? s.questionId,
				roundNumber: s.roundNumber,
				consensusLevel: s.consensusLevel as 'high' | 'medium' | 'low'
			}))
	);

	let selectedQuestionId = $state('');
	$effect(() => {
		if (!selectedQuestionId && data.session.questions.length > 0) {
			selectedQuestionId = data.session.questions[0].id;
		}
	});

	const trendPoints = $derived(
		data.snapshots
			.filter((s) => s.questionId === selectedQuestionId && s.median != null)
			.sort((a, b) => a.roundNumber - b.roundNumber)
			.map((s) => ({ roundNumber: s.roundNumber, value: s.median as number }))
	);

	const previousRound = $derived(rounds.length >= 2 ? rounds[rounds.length - 2] : undefined);
	const currentRound = $derived(rounds.length >= 1 ? rounds[rounds.length - 1] : undefined);

	const comparisonItems = $derived(
		currentRound === undefined
			? []
			: data.session.questions.map((question) => {
					const previous = data.snapshots.find(
						(s) => s.questionId === question.id && s.roundNumber === previousRound
					);
					const current = data.snapshots.find(
						(s) => s.questionId === question.id && s.roundNumber === currentRound
					);
					return {
						questionId: question.id,
						questionText: question.text,
						previousMedian: previous?.median ?? undefined,
						currentMedian: current?.median ?? undefined,
						previousConsensus: previous?.consensusLevel ?? undefined,
						currentConsensus: current?.consensusLevel ?? undefined
					};
				})
	);
</script>

<svelte:head>
	<title>Analytics — {data.session.title} — WeOracle</title>
</svelte:head>

<a href={`/app/${data.session.id}`} class="wbd-back">&larr; {data.session.title}</a>

{#if !data.allowed}
	<PermissionDeniedPanel
		title="You can't view this session's analytics"
		description="Only the session's coordinator or an admin can see cross-round analytics."
		actionLabel="Back to sessions"
		onGoBack={() => goto('/app')}
	/>
{:else if rounds.length === 0}
	<p class="wbd-hint">
		No round snapshots yet — compute round results from the session page first.
	</p>
{:else}
	<h1>Analytics</h1>

	<section>
		<h2>Consensus by question across rounds</h2>
		<QuestionConsensusMatrix {cells} {rounds} />
	</section>

	<section>
		<h2>Median trend</h2>
		<select bind:value={selectedQuestionId}>
			{#each data.session.questions as question (question.id)}
				<option value={question.id}>{question.text}</option>
			{/each}
		</select>
		<MedianTrendChart points={trendPoints} title={questionText.get(selectedQuestionId) ?? ''} />
	</section>

	{#if previousRound !== undefined && currentRound !== undefined}
		<section>
			<h2>Round-over-round comparison</h2>
			<RoundComparisonPanel items={comparisonItems} {previousRound} {currentRound} />
		</section>
	{/if}
{/if}

<style>
	.wbd-back {
		display: inline-block;
		margin-bottom: 0.5rem;
		font-size: 0.8125rem;
		color: var(--color-text-tertiary, #64748b);
		text-decoration: none;
	}
	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.375rem;
		color: var(--color-text-primary, #0f172a);
	}
	section {
		margin-bottom: 2rem;
	}
	section h2 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-hint {
		font-size: 0.8125rem;
		color: var(--color-text-tertiary, #64748b);
	}
	select {
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font: inherit;
	}
</style>
