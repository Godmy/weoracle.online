<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import QuestionOverviewPage from '$stylist/wbd/component/template/question-overview-page/index.svelte';
	import type { StructWbdQuestion } from '$stylist/wbd/type/object/question';

	let { data } = $props();

	let selectedSessionId = $state(data.selectedSessionId);
	let selectedQuestionId = $state(data.questions[0]?.id ?? '');
	let localQuestions = $state<StructWbdQuestion[]>(data.questions);
	const questions = $derived(localQuestions);
	const questionSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const questionSaveState = new Map<
		string,
		{ inFlight: boolean; latest: StructWbdQuestion | null; queued: StructWbdQuestion | null }
	>();

	$effect(() => {
		selectedSessionId = data.selectedSessionId;
		const incomingQuestions = data.questions;
		localQuestions = incomingQuestions.map((question) => {
			const localQuestion = untrack(() => localQuestions.find((item) => item.id === question.id));
			return localQuestion ? { ...question, ...localQuestion } : question;
		});
		selectedQuestionId = untrack(
			() =>
				localQuestions.find((question) => question.id === selectedQuestionId)?.id ??
				localQuestions[0]?.id ??
				''
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
			body: JSON.stringify({ text: 'New question', type: 'estimate' })
		});
		const created = (await res.json()) as StructWbdQuestion;
		if (created.id) {
			selectedQuestionId = created.id;
			localQuestions = [...localQuestions, created];
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
		const saveState = questionSaveState.get(question.id) ?? {
			inFlight: false,
			latest: null,
			queued: null
		};
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
				const saved = (await res.json()) as StructWbdQuestion;
				localQuestions = localQuestions.map((item) => (item.id === question.id ? saved : item));
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

<QuestionOverviewPage
	sessions={data.sessions}
	{selectedSessionId}
	{questions}
	{selectedQuestionId}
	onSelectSession={selectSession}
	onSelectQuestion={(questionId) => (selectedQuestionId = questionId)}
	onCreateQuestion={createQuestion}
	onUpdateQuestion={updateQuestion}
	onDeleteQuestion={deleteQuestion}
/>
