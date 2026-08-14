<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import { SessionQuestionEditor } from 'stylist-svelte';
	import type { StructWbdQuestion } from 'stylist-svelte';
	import { toStructQuestion } from '$lib/wbd/map';
	import type { WbdQuestionRow } from '$lib/wbd/types';

	let { data } = $props();

	let selectedSessionId = $state(data.selectedSessionId);
	let selectedQuestionId = $state(data.questions[0]?.id ?? '');
	let localQuestions = $state<StructWbdQuestion[]>(data.questions.map(toStructQuestion));
	const questions = $derived(localQuestions);
	const selectedSession = $derived(data.sessions.find((session) => session.id === selectedSessionId));
	const totalRequired = $derived(localQuestions.filter((question) => question.required).length);
	const questionSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const questionSaveState = new Map<
		string,
		{ inFlight: boolean; latest: StructWbdQuestion | null; queued: StructWbdQuestion | null }
	>();

	$effect(() => {
		selectedSessionId = data.selectedSessionId;
		const incomingQuestions = data.questions.map(toStructQuestion);
		localQuestions = incomingQuestions.map((question) => {
			const localQuestion = untrack(() => localQuestions.find((item) => item.id === question.id));
			return localQuestion ? { ...question, ...localQuestion } : question;
		});
		selectedQuestionId = untrack(
			() => localQuestions.find((question) => question.id === selectedQuestionId)?.id ?? localQuestions[0]?.id ?? ''
		);
	});

	async function selectSession(sessionId: string) {
		await flushQuestionSaves();
		selectedSessionId = sessionId;
		await goto(sessionId ? `/app/questions?session=${sessionId}` : '/app/questions');
	}

	async function createQuestion() {
		if (!selectedSessionId) return;
		const res = await fetch(`/api/wbd/sessions/${selectedSessionId}/questions`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: 'New question', type: 'numeric' })
		});
		const created = (await res.json()) as { id?: string };
		if (created.id) {
			selectedQuestionId = created.id;
			localQuestions = [...localQuestions, toStructQuestion(created as WbdQuestionRow)];
		}
		await invalidateAll();
	}

	function updateQuestion(question: StructWbdQuestion) {
		localQuestions = localQuestions.map((item) => (item.id === question.id ? question : item));
		queueQuestionSave(question);
	}

	async function deleteQuestion(questionId: string) {
		const existingTimer = questionSaveTimers.get(questionId);
		if (existingTimer) clearTimeout(existingTimer);
		questionSaveTimers.delete(questionId);
		questionSaveState.delete(questionId);
		const remaining = localQuestions.filter((question) => question.id !== questionId);
		if (selectedQuestionId === questionId) selectedQuestionId = remaining[0]?.id ?? '';
		localQuestions = remaining;
		await fetch(`/api/wbd/questions/${questionId}`, { method: 'DELETE' });
		await invalidateAll();
	}

	function queueQuestionSave(question: StructWbdQuestion) {
		const saveState = questionSaveState.get(question.id) ?? { inFlight: false, latest: null, queued: null };
		saveState.latest = question;
		questionSaveState.set(question.id, saveState);

		const existingTimer = questionSaveTimers.get(question.id);
		if (existingTimer) clearTimeout(existingTimer);

		questionSaveTimers.set(
			question.id,
			setTimeout(() => {
				void flushQuestionSave(question.id);
			}, 400)
		);
	}

	async function flushQuestionSave(questionId: string) {
		const existingTimer = questionSaveTimers.get(questionId);
		if (existingTimer) {
			clearTimeout(existingTimer);
			questionSaveTimers.delete(questionId);
		}

		const saveState = questionSaveState.get(questionId);
		if (!saveState?.latest) return;
		if (saveState.inFlight) {
			saveState.queued = saveState.latest;
			return;
		}

		const question = saveState.latest;
		saveState.inFlight = true;
		saveState.queued = null;

		try {
			const res = await fetch(`/api/wbd/questions/${question.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(question)
			});
			if (res.ok && saveState.latest === question) {
				const saved = (await res.json()) as WbdQuestionRow;
				localQuestions = localQuestions.map((item) => (item.id === question.id ? toStructQuestion(saved) : item));
				saveState.latest = null;
			}
		} finally {
			saveState.inFlight = false;
			if (saveState.queued && saveState.queued !== question) {
				saveState.latest = saveState.queued;
				saveState.queued = null;
				await flushQuestionSave(questionId);
			}
		}
	}

	async function flushQuestionSaves() {
		await Promise.all([...questionSaveState.keys()].map(flushQuestionSave));
	}
</script>

<svelte:head>
	<title>Questions - WeOracle</title>
</svelte:head>

<section class="wbd-questions-page">
	<section class="wbd-questions-page__toolbar" aria-label="Question session selector">
		<label>
			<span>Session</span>
			<select
				value={selectedSessionId}
				onchange={(event) => {
					void selectSession(event.currentTarget.value);
				}}
			>
				{#each data.sessions as session (session.id)}
					<option value={session.id}>{session.title}</option>
				{/each}
			</select>
		</label>
		{#if selectedSession}
			<div class="wbd-questions-page__meta">
				<article class="wbd-questions-page__stat">
					<span>Session status</span>
					<strong>{selectedSession.status}</strong>
				</article>
				<article class="wbd-questions-page__stat">
					<span>Required</span>
					<strong>{totalRequired}</strong>
				</article>
				<article class="wbd-questions-page__stat">
					<span>Total questions</span>
					<strong>{localQuestions.length}</strong>
				</article>
			</div>
		{/if}
	</section>

	{#if selectedSession}
		<section class="wbd-questions-page__editor">
			<SessionQuestionEditor
				{questions}
				{selectedQuestionId}
				onSelectQuestion={(questionId) => (selectedQuestionId = questionId)}
				onCreateQuestion={createQuestion}
				onUpdateQuestion={updateQuestion}
				onDeleteQuestion={deleteQuestion}
			/>
		</section>
	{:else}
		<section class="wbd-questions-page__empty">
			<p>No sessions yet.</p>
			<a href="/app/new">Create session</a>
		</section>
	{/if}
</section>

<style>
	.wbd-questions-page {
		display: grid;
		gap: 1rem;
	}
	.wbd-questions-page__toolbar,
	.wbd-questions-page__editor,
	.wbd-questions-page__empty {
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.5rem;
		background: var(--color-background-secondary, #f8fafc);
		padding: 1rem;
	}
	.wbd-questions-page__toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
	}
	.wbd-questions-page__toolbar > label {
		display: grid;
		gap: 0.375rem;
		width: min(100%, 20rem);
	}
	.wbd-questions-page__toolbar > label > span {
		color: var(--color-text-secondary, #64748b);
		font-size: 0.8125rem;
		font-weight: 700;
	}
	.wbd-questions-page__toolbar select {
		width: 100%;
		min-height: 2.5rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font: inherit;
		padding: 0 0.75rem;
	}
	.wbd-questions-page__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-left: auto;
	}
	.wbd-questions-page__empty a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 2.75rem;
		box-sizing: border-box;
		padding: 0 0.875rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		font-size: 0.8125rem;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}
	.wbd-questions-page__stat {
		display: grid;
		align-content: center;
		gap: 0.125rem;
		height: 2.75rem;
		box-sizing: border-box;
		border: 1px solid var(--color-border-primary, #e2e8f0);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		padding: 0 0.875rem;
	}
	.wbd-questions-page__stat span {
		color: var(--color-text-secondary, #64748b);
		font-size: 0.6875rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.wbd-questions-page__stat strong {
		color: var(--color-text-primary, #0f172a);
		font-size: 0.9375rem;
		line-height: 1;
	}
	.wbd-questions-page__empty {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.wbd-questions-page__empty p {
		margin: 0;
		color: var(--color-text-secondary, #64748b);
	}
	@media (max-width: 760px) {
		.wbd-questions-page__toolbar,
		.wbd-questions-page__empty {
			align-items: stretch;
			flex-direction: column;
		}
		.wbd-questions-page__toolbar > label {
			width: 100%;
		}
		.wbd-questions-page__meta {
			margin-left: 0;
		}
		.wbd-questions-page__meta,
		.wbd-questions-page__stat {
			flex: 1 1 auto;
		}
	}
</style>
