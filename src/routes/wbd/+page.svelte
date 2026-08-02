<script lang="ts">
	import {
		SessionHeader,
		ParticipantRosterList,
		RoundCollectionPanel,
		FacilitatorControlPanel,
		RoundSummaryTable,
		EstimateRangeChart,
		ConvergenceChart,
		DiscussionThread,
		WbsTree,
		FinalEstimateReport,
		calculateWbdPert,
		calculateWbdSpread,
		type StructWbdTask,
		type StructWbdParticipant,
		type StructWbdEstimate,
		type StructWbdRound,
		type StructWbdRoundSummary,
		type StructWbdPertResult,
		type StructWbdDiscussionNote
	} from 'stylist-svelte';

	// --- WBS: 5 epics, 22 estimable leaf tasks ---
	const epics: StructWbdTask[] = [
		{ id: 't1', label: 'Checkout redesign', parentId: null },
		{ id: 't7', label: 'Admin & Operations', parentId: null },
		{ id: 't13', label: 'Search & Discovery', parentId: null },
		{ id: 't18', label: 'Notifications', parentId: null },
		{ id: 't23', label: 'Platform', parentId: null }
	];

	const leafSeeds: { id: string; label: string; parentId: string; base: number; volatility: number }[] = [
		{ id: 't2', label: 'Payment gateway integration', parentId: 't1', base: 8, volatility: 1.6 },
		{ id: 't3', label: 'Order confirmation email', parentId: 't1', base: 2, volatility: 1.2 },
		{ id: 't4', label: 'Cart abandonment recovery', parentId: 't1', base: 5, volatility: 1.3 },
		{ id: 't5', label: 'Guest checkout flow', parentId: 't1', base: 4, volatility: 1.4 },
		{ id: 't6', label: 'Address validation service', parentId: 't1', base: 3, volatility: 1.1 },
		{ id: 't8', label: 'Admin refund panel', parentId: 't7', base: 4, volatility: 1.5 },
		{ id: 't9', label: 'Inventory sync job', parentId: 't7', base: 6, volatility: 1.8 },
		{ id: 't10', label: 'Bulk order export', parentId: 't7', base: 3, volatility: 1.2 },
		{ id: 't11', label: 'Audit log viewer', parentId: 't7', base: 3, volatility: 1.1 },
		{ id: 't12', label: 'Role-based permissions', parentId: 't7', base: 5, volatility: 1.6 },
		{ id: 't14', label: 'Faceted search filters', parentId: 't13', base: 4, volatility: 1.3 },
		{ id: 't15', label: 'Autocomplete suggestions', parentId: 't13', base: 3, volatility: 1.2 },
		{ id: 't16', label: 'Personalized recommendations', parentId: 't13', base: 9, volatility: 2.2 },
		{ id: 't17', label: 'Search analytics dashboard', parentId: 't13', base: 3, volatility: 1.1 },
		{ id: 't19', label: 'Email notification templates', parentId: 't18', base: 2, volatility: 1.1 },
		{ id: 't20', label: 'SMS notification provider', parentId: 't18', base: 4, volatility: 1.7 },
		{ id: 't21', label: 'In-app notification center', parentId: 't18', base: 5, volatility: 1.4 },
		{ id: 't22', label: 'Notification preferences UI', parentId: 't18', base: 2, volatility: 1.1 },
		{ id: 't24', label: 'CI/CD pipeline upgrade', parentId: 't23', base: 6, volatility: 1.9 },
		{ id: 't25', label: 'Observability/tracing rollout', parentId: 't23', base: 5, volatility: 1.6 },
		{ id: 't26', label: 'Feature flag service', parentId: 't23', base: 4, volatility: 1.3 },
		{ id: 't27', label: 'Rate limiting middleware', parentId: 't23', base: 3, volatility: 1.2 }
	];

	const tasks: StructWbdTask[] = [
		...epics,
		...leafSeeds.map(({ id, label, parentId }) => ({ id, label, parentId }))
	];
	const estimableTaskIds = leafSeeds.map((task) => task.id);

	// --- Participants ---
	const participants: StructWbdParticipant[] = [
		{ id: 'p1', displayName: 'Priya Desai', role: 'coordinator' },
		{ id: 'p2', displayName: 'You', role: 'estimator' },
		{ id: 'p3', displayName: 'Marcus Chen', role: 'estimator' },
		{ id: 'p4', displayName: 'Sofia Ivanova', role: 'estimator' }
	];
	const estimators = participants.filter((participant) => participant.role === 'estimator');

	// One estimator leans optimistic, the other pessimistic — this is what creates
	// varying spread across tasks, the thing a range chart is meant to surface.
	function seededEstimate(base: number, volatility: number, skew: -1 | 1): StructWbdEstimate {
		return {
			optimistic: +(base * (0.65 - skew * 0.05)).toFixed(1),
			mostLikely: +(base * (1 + skew * 0.05)).toFixed(1),
			pessimistic: +(base * volatility * (1 + skew * 0.1)).toFixed(1)
		};
	}

	const seedEstimates: Record<string, Record<string, StructWbdEstimate>> = Object.fromEntries(
		leafSeeds.map((task) => [
			task.id,
			{
				p3: seededEstimate(task.base, task.volatility, -1),
				p4: seededEstimate(task.base, task.volatility, 1)
			}
		])
	);

	// --- Live state ---
	let myEstimates = $state<Record<string, StructWbdEstimate>>({});
	let round = $state<StructWbdRound>({ id: 'r2', index: 1, status: 'collecting' });
	let revealed = $state(true);
	let notes = $state<StructWbdDiscussionNote[]>([
		{
			id: 'n1',
			authorLabel: 'Marcus Chen',
			message: 'My pessimistic estimate on the gateway assumes we need a full SDK rewrite.',
			timestamp: '10:12'
		},
		{
			id: 'n2',
			authorLabel: 'Sofia Ivanova',
			message: 'Agreed, but the vendor SDK already covers most of it — I went lower.',
			timestamp: '10:15'
		}
	]);

	const allEstimates = $derived(
		Object.fromEntries(
			estimableTaskIds.map((taskId) => [
				taskId,
				{
					...seedEstimates[taskId],
					...(myEstimates[taskId] ? { p2: myEstimates[taskId] } : {})
				}
			])
		) as Record<string, Record<string, StructWbdEstimate>>
	);

	const roundSummaries = $derived(
		estimableTaskIds.reduce<Record<string, StructWbdRoundSummary>>((acc, taskId) => {
			const values = Object.values(allEstimates[taskId]).map((estimate) => estimate.mostLikely);
			acc[taskId] = { taskId, ...calculateWbdSpread(values) };
			return acc;
		}, {})
	);

	const pertResults = $derived(
		estimableTaskIds.reduce<Record<string, StructWbdPertResult>>((acc, taskId) => {
			const estimates = Object.values(allEstimates[taskId]);
			if (estimates.length === 0) return acc;
			const avg = (key: keyof StructWbdEstimate) =>
				estimates.reduce((sum, estimate) => sum + estimate[key], 0) / estimates.length;
			acc[taskId] = calculateWbdPert({
				optimistic: avg('optimistic'),
				mostLikely: avg('mostLikely'),
				pessimistic: avg('pessimistic')
			});
			return acc;
		}, {})
	);

	function rollupFor(taskId: string): StructWbdPertResult | undefined {
		const direct = pertResults[taskId];
		if (direct) return direct;
		const children = tasks.filter((task) => task.parentId === taskId);
		if (children.length === 0) return undefined;
		const childRollups = children.map((child) => rollupFor(child.id)).filter(Boolean) as StructWbdPertResult[];
		if (childRollups.length === 0) return undefined;
		return {
			optimistic: childRollups.reduce((sum, r) => sum + r.optimistic, 0),
			pessimistic: childRollups.reduce((sum, r) => sum + r.pessimistic, 0),
			expected: childRollups.reduce((sum, r) => sum + r.expected, 0),
			stdDev: Math.sqrt(childRollups.reduce((sum, r) => sum + r.stdDev ** 2, 0))
		};
	}

	const rollups = $derived(
		Object.fromEntries(tasks.map((task) => [task.id, rollupFor(task.id)]).filter(([, v]) => v)) as Record<
			string,
			StructWbdPertResult
		>
	);

	const submittedByParticipant = $derived(
		Object.fromEntries(
			participants.map((participant) => [
				participant.id,
				estimableTaskIds.every((taskId) => allEstimates[taskId][participant.id] !== undefined)
			])
		)
	);

	const rosterParticipants = $derived(
		participants.map((participant) => ({
			...participant,
			hasSubmitted: submittedByParticipant[participant.id]
		}))
	);

	const pendingCount = $derived(estimators.filter((p) => !submittedByParticipant[p.id]).length);

	const rounds = $derived([
		{ id: 'r1', index: 0, status: 'closed' as const },
		{ id: 'r2', index: 1, status: round.status },
		{ id: 'r3', index: 2, status: 'kickoff' as const }
	]);

	// Historical spread for the gateway task, to illustrate one item converging across rounds.
	const gatewayConvergence = $derived([
		{ taskId: 't2', min: 4, max: 20, mean: 11, median: 10, stdDev: 5.2 },
		{ taskId: 't2', min: 5, max: 15, mean: 9.5, median: 9, stdDev: 3.1 },
		roundSummaries.t2
	]);

	function handleSubmitEstimate(taskId: string, estimate: StructWbdEstimate): void {
		myEstimates = { ...myEstimates, [taskId]: estimate };
	}

	function handleAddNote(message: string): void {
		notes = [
			...notes,
			{
				id: `n${notes.length + 1}`,
				authorLabel: 'You',
				message,
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			}
		];
	}
</script>

<svelte:head>
	<title>Wideband Delphi — WeOracle</title>
	<meta name="description" content="Wideband Delphi estimation session built with stylist-svelte." />
</svelte:head>

<main class="wbd-page">
	<div class="wbd-page__container">
		<SessionHeader title="Q3 Roadmap Estimation — 22 items" {rounds} currentRoundId="r2" />

		<div class="wbd-page__grid">
			<section class="wbd-page__panel wbd-page__panel--scroll">
				<RoundCollectionPanel
					tasks={tasks.filter((task) => estimableTaskIds.includes(task.id))}
					values={myEstimates}
					onSubmitEstimate={handleSubmitEstimate}
				/>
			</section>
			<aside class="wbd-page__sidebar">
				<ParticipantRosterList participants={rosterParticipants} />
				<FacilitatorControlPanel
					{round}
					{pendingCount}
					totalCount={estimators.length}
					onOpenRound={() => (round = { ...round, status: 'collecting' })}
					onCloseRound={() => (round = { ...round, status: 'closed' })}
					onRevealResults={() => (revealed = true)}
					onAdvanceRound={() => (round = { ...round, status: 'discussing' })}
					onFinalize={() => (round = { ...round, status: 'finalized' })}
				/>
			</aside>
		</div>

		{#if revealed}
			<section class="wbd-page__section">
				<h2>Estimate ranges across all 22 items</h2>
				<p class="wbd-page__hint">
					Sorted by spread (pessimistic − optimistic) — widest disagreement first. Bar span is
					optimistic→pessimistic, the marker is the PERT-weighted expected value.
				</p>
				<EstimateRangeChart
					tasks={tasks.filter((task) => estimableTaskIds.includes(task.id))}
					results={pertResults}
					unit="d"
				/>
			</section>

			<section class="wbd-page__section">
				<h2>Round results table</h2>
				<RoundSummaryTable
					tasks={tasks.filter((task) => estimableTaskIds.includes(task.id))}
					summaries={estimableTaskIds.map((id) => roundSummaries[id])}
				/>
			</section>

			<section class="wbd-page__section">
				<h2>Convergence of one item across rounds</h2>
				<ConvergenceChart taskLabel="Payment gateway integration" roundSummaries={gatewayConvergence} />
			</section>
		{/if}

		<section class="wbd-page__section">
			<h2>Discussion</h2>
			<DiscussionThread {notes} onAddNote={handleAddNote} />
		</section>

		<section class="wbd-page__section">
			<h2>Work breakdown structure</h2>
			<WbsTree {tasks} {rollups} />
		</section>

		{#if round.status === 'finalized'}
			<section class="wbd-page__section">
				<h2>Final estimate</h2>
				<FinalEstimateReport
					tasks={tasks.filter((task) => estimableTaskIds.includes(task.id))}
					results={pertResults}
				/>
			</section>
		{/if}
	</div>
</main>

<style>
	.wbd-page {
		min-height: 100vh;
		padding: 2rem 1rem 4rem;
	}
	.wbd-page__container {
		max-width: 64rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.wbd-page__grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 768px) {
		.wbd-page__grid {
			grid-template-columns: 1fr;
		}
	}
	.wbd-page__panel {
		padding: 1rem 1.25rem;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.75rem;
		background: var(--color-background-primary, #fff);
	}
	.wbd-page__panel--scroll {
		max-height: 32rem;
		overflow-y: auto;
	}
	.wbd-page__sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.wbd-page__section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.wbd-page__section h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-page__hint {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-text-tertiary, #64748b);
	}
</style>
