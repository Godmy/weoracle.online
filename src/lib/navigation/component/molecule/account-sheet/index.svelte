<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import BottomSheet from '$stylist/navigation/component/organism/bottom-sheet/index.svelte';
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';
	import { Flag } from '$stylist/svg/component/atom/flag';
	import { ThemeModeToggle } from '$stylist/theme/component/atom/theme-mode-toggle';
	import type { ShellLabel } from '$lib/navigation/const/record/shell-label';

	// Google-style account entry: avatar in the top app bar, sheet with language, theme
	// and sign-out (a bottom sheet on phones, a card under the avatar on wider screens).
	let {
		user,
		labels,
		signOutLabel
	}: {
		user: { name: string; email: string; role: string };
		labels: ShellLabel;
		signOutLabel: string;
	} = $props();

	const COOKIE = 'wbd_lang';
	const languages = [
		{ code: 'en', name: 'English', flag: 'GB' },
		{ code: 'es', name: 'Español', flag: 'ES' },
		{ code: 'ru', name: 'Русский', flag: 'RU' }
	];

	let open = $state(false);
	const currentLanguage = $derived((page.data as { lang?: string }).lang ?? 'en');
	const initial = $derived((user.name || user.email).trim().charAt(0).toUpperCase());

	async function changeLanguage(code: string) {
		if (code === currentLanguage) return;
		// Same cookie as LanguageControl; the root layout reloads the translations.
		document.cookie = `${COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
		await invalidateAll();
	}
</script>

<div class="wbd-account">
	<button
		type="button"
		class="wbd-account__avatar"
		aria-label={`${labels.account}: ${user.name}`}
		aria-haspopup="dialog"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		{initial}
	</button>

	<BottomSheet {open} title={labels.account} onClose={() => (open = false)}>
		<div class="wbd-account__card">
			<span class="wbd-account__avatar wbd-account__avatar--large" aria-hidden="true">
				{initial}
			</span>
			<div class="wbd-account__identity">
				<strong>{user.name}</strong>
				<span>{user.email}</span>
				<span class="wbd-account__role">{labels.roles[user.role] ?? user.role}</span>
			</div>
		</div>

		<fieldset class="wbd-account__group">
			<legend><Icon name="globe" size={16} aria-hidden="true" />{labels.language}</legend>
			{#each languages as language (language.code)}
				<label class="wbd-account__option">
					<input
						type="radio"
						name="wbd-account-language"
						value={language.code}
						checked={language.code === currentLanguage}
						onchange={() => changeLanguage(language.code)}
					/>
					<span class="wbd-account__flag">
						<Flag flag={language.flag} code={language.code} size="1.25rem" />
					</span>
					<span>{language.name}</span>
				</label>
			{/each}
		</fieldset>

		<div class="wbd-account__row">
			<span>{labels.theme}</span>
			<ThemeModeToggle />
		</div>

		{#snippet actions()}
			<form method="POST" action="/app/sign-in?/signOut" class="wbd-account__signout">
				<button type="submit">
					<Icon name="lock" size={16} aria-hidden="true" />
					{signOutLabel}
				</button>
			</form>
		{/snippet}
	</BottomSheet>
</div>

<style>
	.wbd-account {
		display: inline-flex;
	}
	.wbd-account__avatar {
		display: inline-grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: var(--color-primary-600, #2563eb);
		color: var(--color-on-primary, #fff);
		font: inherit;
		font-size: 0.9375rem;
		font-weight: 700;
		cursor: pointer;
	}
	.wbd-account__avatar--large {
		flex: 0 0 auto;
		width: 3rem;
		height: 3rem;
		font-size: 1.25rem;
		cursor: default;
	}
	.wbd-account__card {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border-primary, #e2e8f0);
	}
	.wbd-account__identity {
		display: grid;
		min-width: 0;
		gap: 0.125rem;
		color: var(--color-text-primary, #0f172a);
	}
	.wbd-account__identity span {
		overflow: hidden;
		color: var(--color-text-secondary, #475569);
		font-size: 0.8125rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.wbd-account__role {
		font-weight: 600;
	}
	.wbd-account__group {
		display: grid;
		gap: 0.25rem;
		margin: 1rem 0 0;
		padding: 0;
		border: 0;
	}
	.wbd-account__group legend {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
		color: var(--color-text-secondary, #475569);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
	}
	.wbd-account__option,
	.wbd-account__row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 3rem;
		padding: 0 0.75rem;
		border-radius: 999px;
		color: var(--color-text-primary, #0f172a);
		cursor: pointer;
	}
	.wbd-account__option:hover {
		background: var(--color-background-hover, #f1f5f9);
	}
	.wbd-account__option:has(input:checked) {
		background: var(--color-primary-100, #dbeafe);
		font-weight: 600;
	}
	.wbd-account__option input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.wbd-account__option:has(input:focus-visible) {
		outline: 2px solid var(--color-primary-600, #2563eb);
		outline-offset: 2px;
	}
	.wbd-account__flag {
		display: inline-flex;
		overflow: hidden;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 999px;
	}
	.wbd-account__row {
		justify-content: space-between;
		margin-top: 0.5rem;
		cursor: default;
	}
	.wbd-account__signout {
		width: 100%;
		margin: 0;
	}
	.wbd-account__signout button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 2.75rem;
		border: 1px solid var(--color-border-secondary, #cbd5e1);
		border-radius: 999px;
		background: transparent;
		color: var(--color-text-primary, #0f172a);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	/* Wider screens: an account card under the avatar instead of a full-width sheet. */
	@media (min-width: 600px) {
		.wbd-account :global(.c-bottom-sheet) {
			top: 4.5rem;
			right: 1rem;
			bottom: auto;
			left: auto;
			width: min(22rem, calc(100vw - 2rem));
			border-radius: 1rem;
			box-shadow: 0 12px 40px rgba(15, 23, 42, 0.24);
		}
		.wbd-account :global(.c-bottom-sheet__handle) {
			display: none;
		}
		.wbd-account :global(.c-bottom-sheet__backdrop) {
			background: transparent;
		}
	}
</style>
