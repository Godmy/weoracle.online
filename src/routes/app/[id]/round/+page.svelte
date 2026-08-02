<script lang="ts">
	import {
		ConfidenceDistributionChart,
		ConsensusReviewBoard,
		DisagreementPromptCard,
		DiscussionMessageThread,
		ExportResultsPanel,
		RationaleDigest,
		ResponseDistributionChart,
		RoundSnapshotBoard
	} from 'stylist-svelte';
	import { toStructDiscussionMessage } from '$lib/wbd/map';
	import type { WbdDiscussionMessageRow } from '$lib/wbd/types';

	let { data } = $props();

	const questionLabels = $derived(
		Object.fromEntries(data.roundView.questions.map((q) => [q.id, q.text]))
	);

	const consensusItems = $derived(
		data.roundView.questions.map((question) => {
			const snapshot = data.roundView.snapshotByQuestion[question.id];
			const answers = data.roundView.answersByQuestion[question.id] ?? [];
			return {
				questionId: question.id,
				questionText: question.text,
				category: question.category ?? undefined,
				consensusLevel: snapshot?.consensus_level ?? 'low',
				countResponses: snapshot?.count_responses ?? answers.length,
				median: snapshot?.median ?? undefined,
				q1: snapshot?.q1 ?? undefined,
				q3: snapshot?.q3 ?? undefined,
				minValue: snapshot?.min_value ?? undefined,
				maxValue: snapshot?.max_value ?? undefined,
				rationaleCount: answers.filter((a) => a.rationale).length
			};
		})
	);
	const disagreements = $derived(consensusItems.filter((item) => item.consensusLevel === 'low'));

	let selectedQuestionId = $state('');

	const confidenceDistribution = $derived.by(() => {
		const counts = new Map<number, number>([1, 2, 3, 4, 5].map((c) => [c, 0]));
		for (const answers of Object.values(data.roundView.answersByQuestion)) {
			for (const answer of answers) {
				if (answer.confidence != null) counts.set(answer.confidence, (counts.get(answer.confidence) ?? 0) + 1);
			}
		}
		return [1, 2, 3, 4, 5].map((confidence) => ({ confidence: confidence as 1 | 2 | 3 | 4 | 5, count: counts.get(confidence) ?? 0 }));
	});

	const selectedQuestionResponseBins = $derived.by(() => {
		const answers = data.roundView.answersByQuestion[selectedQuestionId] ?? [];
		const values = answers.map((a) => a.realistic).filter((v): v is number => v != null);
		if (values.length === 0) return [];

		const min = Math.min(...values);
		const max = Math.max(...values);
		if (min === max) return [{ label: `${min}`, count: values.length }];

		const bucketCount = 5;
		const width = (max - min) / bucketCount;
		const bins = Array.from({ length: bucketCount }, (_, i) => ({
			label: `${(min + i * width).toFixed(1)}–${(min + (i + 1) * width).toFixed(1)}`,
			count: 0
		}));
		for (const value of values) {
			const index = Math.min(bucketCount - 1, Math.floor((value - min) / width));
			bins[index].count += 1;
		}
		return bins;
	});

	const snapshots = $derived(
		Object.values(data.roundView.snapshotByQuestion).filter((s): s is NonNullable<typeof s> => Boolean(s))
	);

	const rationaleItems = $derived(
		data.roundView.questions.flatMap((question) =>
			(data.roundView.answersByQuestion[question.id] ?? [])
				.filter((answer) => answer.rationale)
				.map((answer) => ({
					id: answer.id,
					questionId: question.id,
					questionText: question.text,
					roundNumber: answer.round_number,
					rationale: answer.rationale as string,
					confidence: answer.confidence ?? undefined,
					consensusLevel: data.roundView.snapshotByQuestion[question.id]?.consensus_level ?? undefined
				}))
		)
	);

	const exportOptions = [
		{ id: 'csv' as const, label: 'CSV', description: 'Snapshot stats per question' },
		{ id: 'json' as const, label: 'JSON', description: 'Full round data' }
	];

	function download(filename: string, content: string, type: string) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportOption(option: { id: string }) {
		const base = `${data.roundView.session.title}-round-${data.round}`;
		if (option.id === 'csv') {
			const header = 'question,category,responses,median,q1,q3,min,max,consensus';
			const rows = data.roundView.questions.map((q) => {
				const s = data.roundView.snapshotByQuestion[q.id];
				return [
					JSON.stringify(q.text),
					q.category ?? '',
					s?.count_responses ?? 0,
					s?.median ?? '',
					s?.q1 ?? '',
					s?.q3 ?? '',
					s?.min_value ?? '',
					s?.max_value ?? '',
					s?.consensus_level ?? ''
				].join(',');
			});
			download(`${base}.csv`, [header, ...rows].join('\n'), 'text/csv');
		} else if (option.id === 'json') {
			download(`${base}.json`, JSON.stringify(data.roundView, null, 2), 'application/json');
		}
	}

	let discussionMessages = $state<WbdDiscussionMessageRow[]>([]);
	$effect(() => {
		if (!selectedQuestionId) {
			discussionMessages = [];
			return;
		}
		fetch(`/api/wbd/questions/${selectedQuestionId}/discussion?round=${data.round}`)
			.then((r) => r.json())
			.then((rows) => (discussionMessages = rows));
	});
</script>

<svelte:head>
	<title>Round {data.round} — {data.roundView.session.title} — WeOracle</title>
</svelte:head>

<a href={`/app/${data.roundView.session.id}`} class="wbd-back">&larr; {data.roundView.session.title}</a>
<h1>Round {data.round} results</h1>

<section>
	<h2>Snapshots</h2>
	{#if snapshots.length === 0}
		<p class="wbd-hint">No snapshot computed yet — use "Compute round results" on the session page.</p>
	{:else}
		<RoundSnapshotBoard
			snapshots={snapshots.map((s) => ({
				id: s.id,
				sessionId: s.session_id,
				roundNumber: s.round_number,
				questionId: s.question_id,
				countResponses: s.count_responses,
				median: s.median ?? undefined,
				q1: s.q1 ?? undefined,
				q3: s.q3 ?? undefined,
				minValue: s.min_value ?? undefined,
				maxValue: s.max_value ?? undefined,
				consensusLevel: s.consensus_level ?? undefined
			}))}
			{questionLabels}
		/>
	{/if}
</section>

{#if disagreements.length > 0}
	<section>
		<h2>Disagreements</h2>
		<div class="wbd-disagreement-grid">
			{#each disagreements as item (item.questionId)}
				<DisagreementPromptCard {item} />
			{/each}
		</div>
	</section>
{/if}

<section>
	<h2>Consensus by question</h2>
	<ConsensusReviewBoard items={consensusItems} onSelectQuestion={(id) => (selectedQuestionId = id)} />
</section>

{#if rationaleItems.length > 0}
	<section>
		<h2>Rationales</h2>
		<RationaleDigest items={rationaleItems} />
	</section>
{/if}

<section>
	<h2>Confidence distribution</h2>
	<ConfidenceDistributionChart items={confidenceDistribution} />
</section>

<section>
	<h2>Discussion &amp; response distribution</h2>
	<select bind:value={selectedQuestionId}>
		<option value="">Select a question…</option>
		{#each data.roundView.questions as question (question.id)}
			<option value={question.id}>{question.text}</option>
		{/each}
	</select>
	{#if selectedQuestionId}
		{#if selectedQuestionResponseBins.length > 0}
			<ResponseDistributionChart bins={selectedQuestionResponseBins} title="Realistic estimates" />
		{/if}
		<DiscussionMessageThread messages={discussionMessages.map((m) => toStructDiscussionMessage(m))} />
	{/if}
</section>

<section>
	<h2>Export</h2>
	<ExportResultsPanel options={exportOptions} onExport={exportOption} />
</section>

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
	.wbd-disagreement-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: 0.75rem;
	}
	select {
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		font: inherit;
	}
</style>
