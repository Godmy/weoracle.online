<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { Flag, Tooltip } from 'stylist-svelte';
	import type { Language } from 'stylist-svelte';

	const COOKIE = 'wbd_lang';

	const languages: Language[] = [
		{ code: 'en', name: 'English', nativeName: 'English', flag: 'GB' },
		{ code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
		{ code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' }
	];

	let isOpen = $state(false);
	// Sourced from the root layout's server load (the D1-backed translation set for this
	// language), not localStorage — keeps SSR markup and the client in sync on first paint.
	const currentLanguage = $derived((page.data as { lang?: string }).lang ?? 'en');
	const selectedLanguage = $derived(
		languages.find((language) => language.code === currentLanguage) ?? languages[0]
	);
	const selectedFlagScale = $derived(selectedLanguage.flag === 'GB' ? 2.05 : 1.45);
	const selectedLanguageLabel = $derived(selectedLanguage.nativeName ?? selectedLanguage.name);

	async function handleLanguageChange(code: string) {
		isOpen = false;
		if (code === currentLanguage) return;
		document.cookie = `${COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
		await invalidateAll();
	}
</script>

<div class="wbd-language-control">
	<Tooltip content={selectedLanguageLabel} placement="bottom" trigger="hover" variant="arrow" asChild>
		{#snippet children()}
			<button
				type="button"
				class="wbd-language-control__button"
				aria-label={selectedLanguageLabel}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				style={`--wbd-language-flag-scale: ${selectedFlagScale}`}
				onclick={() => {
					isOpen = !isOpen;
				}}
			>
				<Flag flag={selectedLanguage.flag} code={selectedLanguage.code} size="2.25rem" />
			</button>
		{/snippet}
	</Tooltip>

	{#if isOpen}
		<div class="wbd-language-control__dropdown" role="listbox" aria-label="Language">
			{#each languages as language}
				<button
					type="button"
					class:wbd-language-control__option--active={language.code === currentLanguage}
					class="wbd-language-control__option"
					role="option"
					aria-selected={language.code === currentLanguage}
					onclick={() => handleLanguageChange(language.code)}
				>
					{language.nativeName ?? language.name}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.wbd-language-control {
		position: relative;
		display: inline-flex;
	}

	.wbd-language-control__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 9999px;
		background: var(--color-background-primary, #fff);
		color: var(--color-text-primary, #0f172a);
		cursor: pointer;
		overflow: hidden;
	}

	.wbd-language-control__button:hover {
		background: var(--color-background-secondary, #f8fafc);
	}

	.wbd-language-control__button :global(.flag) {
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		overflow: hidden;
	}

	.wbd-language-control__button :global(svg) {
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		object-fit: cover;
		transform: scale(var(--wbd-language-flag-scale));
		transform-origin: center;
	}

	.wbd-language-control__dropdown {
		position: absolute;
		z-index: var(--z-index-docked, 10);
		top: calc(100% + 0.25rem);
		right: 0;
		display: grid;
		min-width: 8rem;
		padding: 0.25rem;
		border: 1px solid var(--color-border-primary, #cbd5e1);
		border-radius: 0.375rem;
		background: var(--color-background-primary, #fff);
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
	}

	.wbd-language-control__option {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 0;
		border-radius: 0.25rem;
		background: transparent;
		color: var(--color-text-primary, #0f172a);
		font: inherit;
		font-size: 0.875rem;
		text-align: left;
		cursor: pointer;
	}

	.wbd-language-control__option:hover,
	.wbd-language-control__option--active {
		background: var(--color-background-secondary, #f8fafc);
	}
</style>
