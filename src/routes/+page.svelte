<script lang="ts">
	import { page } from '$app/state';
	import BrandLogo from '$lib/brand-logo.svelte';
	import LanguageControl from '$lib/wbd/language-control.svelte';
	import { ObjectLanding } from '$lib/i18n/const/object/landing';
	import { WbdLandingPage } from 'stylist-svelte';

	const imageAlt: Record<string, { hero: string; workflow: string; result: string }> = {
		ru: {
			hero: 'Аналитическая комната принятия решений с панелью экспертного консенсуса',
			workflow: 'Схема процесса Wideband Delphi от экспертного ввода до финального консенсуса',
			result: 'Цифровой decision brief с диапазонами, рисками и итоговым консенсусом'
		},
		en: {
			hero: 'Analytics decision room with an expert consensus dashboard',
			workflow: 'Diagram of the Wideband Delphi process from expert input to final consensus',
			result: 'Digital decision brief with ranges, risks, and the final consensus'
		},
		es: {
			hero: 'Sala de decisiones analítica con un panel de consenso experto',
			workflow: 'Diagrama del proceso Wideband Delphi desde la entrada de expertos hasta el consenso final',
			result: 'Brief de decisión digital con rangos, riesgos y el consenso final'
		}
	};

	const currentLang = $derived((page.data as { lang?: string }).lang ?? 'en');
	const content = $derived(ObjectLanding[currentLang] ?? ObjectLanding.en);
	const alt = $derived(imageAlt[currentLang] ?? imageAlt.en);
</script>

<WbdLandingPage
	{content}
	heroImageSrc="/gen/hero-1.png"
	heroImageAlt={alt.hero}
	workflowImageSrc="/gen/about.png"
	workflowImageAlt={alt.workflow}
	resultImageSrc="/gen/result-consensus-decision-brief.png"
	resultImageAlt={alt.result}
>
	{#snippet brand()}
		<BrandLogo class="nav__brand" href="/" size="1.75rem" />
	{/snippet}
	{#snippet languageControl()}
		<LanguageControl />
	{/snippet}
</WbdLandingPage>
