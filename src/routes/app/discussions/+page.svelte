<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props();
</script>

<svelte:head>
	<title>Discussions - WeOracle</title>
</svelte:head>

<section class="page">
	<div class="feed">
		{#each data.discussions as discussion (discussion.id)}
			<article>
				<header>
					<strong>{discussion.alias}</strong>
					<span>{discussion.session_title} / {t('discussions.roundLabel')} {discussion.round_number}</span>
				</header>
				<a href={`/app/${discussion.session_id}/round?round=${discussion.round_number}`}>{discussion.question_text}</a>
				<p>{discussion.message}</p>
				<time datetime={discussion.created_at}>{discussion.created_at}</time>
			</article>
		{:else}
			<div class="empty">{t('discussions.empty')}</div>
		{/each}
	</div>
</section>

<style>
	.page { display: grid; gap: 1.25rem; }
	.feed { display: grid; gap: 0.75rem; }
	article, .empty { border: 1px solid var(--color-border-primary, #e2e8f0); border-radius: 0.5rem; background: var(--color-background-secondary, #f8fafc); padding: 1rem; }
	article header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem; }
	article header span, time { color: var(--color-text-secondary, #64748b); font-size: 0.8125rem; }
	a { color: var(--color-text-primary, #0f172a); font-weight: 700; text-decoration: none; }
	p { margin: 0.75rem 0; color: var(--color-text-primary, #0f172a); }
	.empty { color: var(--color-text-secondary, #64748b); text-align: center; }
	@media (max-width: 760px) { article header { flex-direction: column; } }
</style>
