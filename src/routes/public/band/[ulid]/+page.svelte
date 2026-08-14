<script lang="ts">
	import ExpertRoundExperience from '$lib/wbd/expert-round-experience.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.session.title} — WeOracle</title>
</svelte:head>

<div class="wbd-public-band">
	<ExpertRoundExperience session={data.session} questions={data.questions} answers={data.answers} token={data.token} />
</div>

<style>
	.wbd-public-band {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
</style>
