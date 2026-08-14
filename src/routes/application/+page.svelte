<script lang="ts">
	import { page } from '$app/state';
	import BrandLogo from '$lib/brand-logo.svelte';
	import LanguageControl from '$lib/wbd/language-control.svelte';
	import { ObjectLanding } from '$lib/i18n/const/object/landing';

	type RequestOption = {
		id: string;
		text: string;
		body: string;
		buttonText: string;
	};

	const defaultOptions: RequestOption[] = [
		{
			id: 'private-session',
			text: 'Private session',
			body: 'Run a closed expert session for one decision, budget, forecast, or project range.',
			buttonText: 'Request session'
		},
		{
			id: 'public-poll',
			text: 'Public poll',
			body: 'Publish a public question with images and collect expert participation requests.',
			buttonText: 'Request poll'
		},
		{
			id: 'enterprise-setup',
			text: 'Enterprise setup',
			body: 'Set up roles, templates, reporting, and governance for repeated decisions.',
			buttonText: 'Request setup'
		}
	];

	const currentLang = $derived((page.data as { lang?: string }).lang ?? 'en');
	const content = $derived(ObjectLanding[currentLang] ?? ObjectLanding.en);
	const applicationCta = $derived(
		content.applicationCta ?? {
			eyebrow: 'Start a request',
			title: 'Application form',
			body: 'Choose the request type, add contact details, and send the application to WeOracle.',
			options: defaultOptions,
			formTitle: 'Application form',
			nameLabel: 'Name',
			emailLabel: 'Email',
			companyLabel: 'Company',
			messageLabel: 'What decision do you need to support?',
			submitLabel: 'Send application',
			thanksTitle: 'Application sent',
			thanksBody: 'Thanks — we received your request. We will contact you by email shortly.',
			thanksBodyWithType: 'Thanks — we received your "{type}" request. We will contact you by email shortly.',
			thanksLink: 'Send another request'
		}
	);
	const options = $derived(applicationCta.options.length ? applicationCta.options : defaultOptions);
	let requestType = $state(page.url.searchParams.get('type') ?? defaultOptions[0]?.id ?? '');
	const submitted = $derived(page.url.searchParams.get('submitted') === '1');
	const submittedOption = $derived(options.find((option) => option.id === page.url.searchParams.get('type')));

	$effect(() => {
		if (!options.some((option) => option.id === requestType)) {
			requestType = options[0]?.id ?? '';
		}
	});
</script>

<svelte:head>
	<title>Application form - WeOracle</title>
	<meta name="description" content="Send a WeOracle application request." />
</svelte:head>

<main class="application-page">
	<header class="application-page__nav">
		<BrandLogo class="application-page__brand" href="/" size="1.75rem" />
		<div class="application-page__nav-actions">
			<LanguageControl />
			<a href="/" class="application-page__back">Back</a>
		</div>
	</header>

	<section class="application-page__shell" aria-label={applicationCta.formTitle}>
		<div class="application-page__copy">
			<p>{applicationCta.eyebrow}</p>
			<h1>{applicationCta.formTitle}</h1>
			{#if applicationCta.body}
				<span>{applicationCta.body}</span>
			{/if}
		</div>

		{#if submitted}
			<div class="application-page__thanks">
				<h2>{applicationCta.thanksTitle}</h2>
				<p>
					{submittedOption && applicationCta.thanksBodyWithType
						? applicationCta.thanksBodyWithType.replace('{type}', submittedOption.text)
						: applicationCta.thanksBody}
				</p>
				<a href="/application" class="application-page__thanks-link">{applicationCta.thanksLink}</a>
			</div>
		{:else}
			<form method="POST" action="/api/wbd/applications" class="application-page__form">
				<fieldset class="application-page__options">
					<legend>Request type</legend>
					{#each options as option (option.id)}
						<label
							class="application-page__option"
							class:application-page__option--active={requestType === option.id}
						>
							<input type="radio" name="requestType" value={option.id} bind:group={requestType} required />
							<span>
								<strong>{option.text}</strong>
								<small>{option.body}</small>
							</span>
						</label>
					{/each}
				</fieldset>

				<label>
					<span>{applicationCta.nameLabel}</span>
					<input name="name" autocomplete="name" required />
				</label>
				<label>
					<span>{applicationCta.emailLabel}</span>
					<input type="email" name="email" autocomplete="email" required />
				</label>
				<label>
					<span>{applicationCta.companyLabel}</span>
					<input name="company" autocomplete="organization" />
				</label>
				<label>
					<span>{applicationCta.messageLabel}</span>
					<textarea name="message" rows="6" required></textarea>
				</label>

				<button type="submit">{applicationCta.submitLabel}</button>
			</form>
		{/if}
	</section>
</main>

<style>
	.application-page {
		--application-bg: #091016;
		--application-text: #edf5ef;
		--application-heading: #ffffff;
		--application-muted: rgba(237, 245, 239, 0.72);
		--application-accent: #a8d7b3;
		--application-cta: #d7a642;
		--application-cta-text: #0d1412;
		--application-border: rgba(151, 181, 164, 0.22);
		--application-panel: rgba(234, 246, 236, 0.045);

		min-height: 100vh;
		padding: 1rem;
		background: var(--application-bg);
		color: var(--application-text);
		box-sizing: border-box;
	}

	:global(html.light) .application-page {
		--application-bg: #f6f4ed;
		--application-text: #102018;
		--application-heading: #07140f;
		--application-muted: rgba(16, 32, 24, 0.72);
		--application-accent: #27684a;
		--application-cta: #b47a20;
		--application-cta-text: #fffaf0;
		--application-border: rgba(39, 104, 74, 0.22);
		--application-panel: rgba(255, 255, 255, 0.64);
	}

	.application-page__nav,
	.application-page__shell {
		width: min(100%, 1180px);
		margin: 0 auto;
	}

	.application-page__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 0 3rem;
	}

	:global(.application-page__brand) {
		color: var(--application-heading);
		text-decoration: none;
	}

	.application-page__nav-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.application-page__back {
		color: var(--application-muted);
		font-size: 0.875rem;
		font-weight: 700;
		text-decoration: none;
	}

	.application-page__shell {
		display: grid;
		grid-template-columns: minmax(0, 0.85fr) minmax(22rem, 1.15fr);
		gap: 3rem;
		align-items: start;
		padding-bottom: 4rem;
	}

	.application-page__copy {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.application-page__copy p,
	.application-page__copy h1,
	.application-page__copy span {
		margin: 0;
	}

	.application-page__copy p {
		color: var(--application-accent);
		font-size: 0.8125rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	.application-page__copy h1 {
		color: var(--application-heading);
		font-size: clamp(2rem, 4cqw, 3.5rem);
		line-height: 1.05;
	}

	.application-page__copy span {
		color: var(--application-muted);
		line-height: 1.6;
	}

	.application-page__thanks {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		padding: 2rem;
		border: 1px solid var(--application-border);
		border-radius: 0.5rem;
		background: var(--application-panel);
	}

	.application-page__thanks h2 {
		margin: 0;
		color: var(--application-heading);
		font-size: 1.5rem;
	}

	.application-page__thanks p {
		margin: 0;
		color: var(--application-muted);
		line-height: 1.6;
	}

	.application-page__thanks-link {
		justify-self: start;
		color: var(--application-accent);
		font-size: 0.875rem;
		font-weight: 700;
		text-decoration: underline;
	}

	.application-page__form {
		display: grid;
		gap: 1rem;
	}

	.application-page__options {
		display: grid;
		gap: 0.75rem;
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.application-page__options legend,
	.application-page__form label span {
		margin-bottom: 0.375rem;
		color: var(--application-muted);
		font-size: 0.8125rem;
		font-weight: 700;
	}

	.application-page__option {
		display: grid;
		grid-template-columns: 1.25rem minmax(0, 1fr);
		gap: 0.75rem;
		align-items: start;
		padding: 1rem;
		border: 1px solid var(--application-border);
		border-radius: 0.5rem;
		background: var(--application-panel);
		cursor: pointer;
	}

	.application-page__option--active {
		border-color: var(--application-accent);
	}

	.application-page__option input {
		margin-top: 0.2rem;
		accent-color: var(--application-accent);
	}

	.application-page__option span {
		display: grid;
		gap: 0.375rem;
	}

	.application-page__option strong {
		color: var(--application-heading);
	}

	.application-page__option small {
		color: var(--application-muted);
		line-height: 1.45;
	}

	.application-page__form label {
		display: grid;
		gap: 0.375rem;
	}

	.application-page__form input,
	.application-page__form textarea {
		min-width: 0;
		padding: 0.75rem;
		border: 1px solid var(--application-border);
		border-radius: 0.375rem;
		background: transparent;
		color: var(--application-heading);
		font: inherit;
	}

	.application-page__form input {
		height: 2.625rem;
	}

	.application-page__form textarea {
		resize: vertical;
	}

	.application-page__form button {
		min-height: 2.75rem;
		border: 0;
		border-radius: 0.375rem;
		background: var(--application-cta);
		color: var(--application-cta-text);
		font-size: 0.9375rem;
		font-weight: 800;
		cursor: pointer;
	}

	@media (max-width: 760px) {
		.application-page__nav {
			padding-bottom: 2rem;
		}

		.application-page__shell {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}
</style>
